import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import fitz


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PDF = ROOT / "ENE_v33_iS1_Congress_Abstract_Book.pdf"
FULL_JSON = ROOT / "ean_2026_abstracts_analysis_ready.json"
TARGET = ROOT / "assets" / "data" / "abstracts-index.json"

MEETING = "12th Congress of the European Academy of Neurology - Geneva 2026"
MEETING_SHORT = "EAN 2026"
MEETING_THEME = "Neurology within society"
CONGRESS_URL = "https://www.ean.org/congress2026"
ABSTRACT_BOOK_URL = "https://www.ean.org/congress2026/abstracts/important-information/ean-2026-congress-abstract-book"
PDF_DOI = "https://doi.org/10.1111/ene.70622"

PRESENTATION_TYPES = {
    "OPR": "Oral Presentation",
    "EPO": "ePoster",
    "EPV": "ePosters Virtual",
}
TRACK_BASES = {
    "ageing and dementia",
    "autonomic nervous system diseases",
    "cerebrovascular diseases",
    "child neurology/developmental neurology",
    "clinical neurophysiology",
    "cognitive neurology/neuropsychology",
    "coma and chronic disorders of consciousness",
    "education in neurology",
    "environmental neurology/climate change",
    "epilepsy",
    "ethics in neurology",
    "headache",
    "higher cortical functions",
    "history of neurology",
    "infectious diseases",
    "motor neurone diseases",
    "movement disorders",
    "ms and related disorders",
    "muscle and neuromuscular junction disorder",
    "neurocritical care",
    "neuroepidemiology",
    "neurogenetics",
    "neuroimaging",
    "neuroimaging and neurosonology",
    "neuroimmunology",
    "neuroinformatics",
    "neurological manifestation of systemic diseases",
    "neurology and arts",
    "neuro-oncology",
    "neuro-ophthalmology/neuro-otology",
    "neuropathies",
    "neurorehabilitation",
    "neurorehabilitation and neurotraumatology",
    "neurosonology",
    "neurotoxicology/occupational neurology",
    "neurotraumatology",
    "pain",
    "palliative care",
    "peripheral nerve disorders",
    "sleep-wake disorders",
    "spinal cord and root disorders",
    "treatment in ms and related disorders",
}

DATE_RE = re.compile(r"^(Saturday|Sunday|Monday|Tuesday),\s+June\s+\d{1,2}\s+2026$", re.I)
MARKER_RE = re.compile(r"^(OPR|EPO|EPV)-\s*(\d{3,4})\s*\|\s*(.*)$")
PAGE_RE = re.compile(r"^\d+\s+of\s+\d+$")
SECTION_RE = re.compile(
    r"^(Background and Aims|Background and aims|Background|Aims|Objective|Objectives|"
    r"Purpose|Methods|Results|Conclusion|Conclusions|Discussion|Case presentation|"
    r"Case Description|Disclosure|Funding|Acknowledgements|References)\s*:\s*(.*)$",
    re.I,
)
AUTHOR_RE = re.compile(r"^([A-Z]\.|[A-Z][a-zÀ-ÿ'’-]+,\s+[A-Z]\.|[A-Z][a-zÀ-ÿ'’-]+\s+[A-Z]\.)")
AFFILIATION_RE = re.compile(
    r"^(\d+|Department|Dept\.|Division|Institute|University|Hospital|Clinic|Centre|Center|"
    r"Laboratory|Lab\.|School|Faculty|Neurology|Neuroscience|Nurse|Green Templeton|"
    r"IRCCS|INSERM|CNRS|CHU|APHP|NHS|National|Research)",
    re.I,
)
IGNORE_EXACT = {
    "European Journal of Neurology",
    "ABSTRACTS",
    "SUPPLEMENT ABSTRACTS",
    "SPECIAL ISSUE  Abstracts of the 12th Congress of the European Academy of",
    "Neurology, Geneva",
}


def normalize_line(value):
    value = str(value or "")
    replacements = {
        "\u00ad": "",
        "\u2010": "-",
        "\u2011": "-",
        "\u2012": "-",
        "\u2013": "-",
        "\u2014": "-",
        "\u2009": " ",
        "\u200a": " ",
        "\u202f": " ",
        "\u00a0": " ",
        "\u200b": "",
        "\ufeff": "",
        "\t": " ",
    }
    for old, new in replacements.items():
        value = value.replace(old, new)
    value = value.replace("  | ", " | ").replace("| ", "| ").replace(" |", " |")
    return re.sub(r"\s+", " ", value).strip()


def compact_text(value, limit=None):
    text = re.sub(r"[ \t]+", " ", str(value or "")).strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    if limit and len(text) > limit:
        return text[: limit - 1].rstrip() + "..."
    return text


def join_wrapped_lines(lines):
    output = ""
    for raw in lines:
        line = normalize_line(raw)
        if not line:
            continue
        if not output:
            output = line
        elif output.endswith("-") and not output.endswith((" -", "--")):
            output = output[:-1] + line
        else:
            output += " " + line
    return compact_text(output)


def clean_pdf_line(line):
    line = normalize_line(line)
    if not line:
        return ""
    if line in IGNORE_EXACT:
        return ""
    if PAGE_RE.match(line):
        return ""
    if line.startswith(("European Journal of Neurology, 2026", "https://doi.org/")):
        return ""
    if line.startswith(("This is an open access article", "provided the original work", "© 2026 The Author")):
        return ""
    if line.startswith("FIGURE "):
        return ""
    return line


def is_track_heading(line):
    if not line or ":" in line or "|" in line:
        return False
    if not line[0].isupper():
        return False
    if re.search(r"[.;,#]", line):
        return False
    if MARKER_RE.match(line) or DATE_RE.match(line):
        return False
    if line in PRESENTATION_TYPES.values():
        return False
    if len(line.split()) < 2:
        return False
    if len(line) > 90:
        return False
    lower = line.lower()
    if lower.startswith(("background", "methods", "results", "conclusion", "disclosure")):
        return False
    if re.search(r"\b(abstract|journal|copyright|author|department|university|hospital)\b", lower):
        return False
    base = re.sub(r"\s+\d+$", "", line)
    base = re.sub(r"\s*/\s*", "/", base)
    base = re.sub(r"\s+", " ", base).strip().lower()
    return base in TRACK_BASES


def collect_lines():
    if not SOURCE_PDF.exists():
        raise FileNotFoundError(f"Missing source PDF: {SOURCE_PDF}")
    doc = fitz.open(SOURCE_PDF)
    lines = []
    for page_index in range(30, doc.page_count):
        page_number = page_index + 1
        for raw_line in doc[page_index].get_text("text").splitlines():
            line = clean_pdf_line(raw_line)
            if line:
                lines.append({"page": page_number, "text": line})
    return lines, doc.page_count


def block_records(lines):
    records = []
    current = None
    context = {
        "presentation_type": "",
        "display_date": "",
        "track": "",
    }

    for item in lines:
        line = item["text"]
        marker = MARKER_RE.match(line)
        if marker:
            if current:
                records.append(current)
            prefix, number, title = marker.groups()
            presentation_type = PRESENTATION_TYPES[prefix]
            current = {
                "uid": f"{prefix}-{number}",
                "prefix": prefix,
                "number": number,
                "title_lines": [title] if title else [],
                "content_lines": [],
                "page": item["page"],
                "presentation_type": presentation_type,
                "display_date": context["display_date"],
                "track": context["track"] or presentation_type,
            }
            context["presentation_type"] = presentation_type
            continue

        if line in PRESENTATION_TYPES.values():
            context["presentation_type"] = line
            continue
        elif DATE_RE.match(line):
            context["display_date"] = line
            continue
        elif is_track_heading(line):
            context["track"] = line
            continue

        if current:
            current["content_lines"].append(line)

    if current:
        records.append(current)
    return records


def normalize_section_label(label):
    label = compact_text(label)
    mapping = {
        "background and aims": "Background and Aims",
        "background and aim": "Background and Aims",
        "aims": "Aims",
        "objective": "Objective",
        "objectives": "Objectives",
        "conclusion": "Conclusion",
        "conclusions": "Conclusions",
        "case description": "Case Description",
        "case presentation": "Case Presentation",
    }
    return mapping.get(label.lower(), label[:1].upper() + label[1:])


def split_front_matter(lines):
    if not lines:
        return "", "", [], []

    abstract_start = None
    for index, line in enumerate(lines):
        if SECTION_RE.match(line):
            abstract_start = index
            break

    pre_body = lines[:abstract_start] if abstract_start is not None else lines
    body = lines[abstract_start:] if abstract_start is not None else []

    author_start = None
    for index, line in enumerate(pre_body):
        if AUTHOR_RE.match(line):
            author_start = index
            break

    if author_start is None:
        return join_wrapped_lines(pre_body), "", [], body

    title_lines = pre_body[:author_start]
    remainder = pre_body[author_start:]
    affiliation_start = None
    for index, line in enumerate(remainder[1:], start=1):
        if AFFILIATION_RE.match(line):
            affiliation_start = index
            break

    if affiliation_start is None:
        author_lines = remainder
        affiliation_lines = []
    else:
        author_lines = remainder[:affiliation_start]
        affiliation_lines = remainder[affiliation_start:]

    return join_wrapped_lines(title_lines), join_wrapped_lines(author_lines), affiliation_lines, body


def parse_sections(body_lines):
    sections = {}
    current_label = None
    current_lines = []

    def flush():
        nonlocal current_label, current_lines
        if current_label and current_lines:
            value = join_wrapped_lines(current_lines)
            if value:
                sections[current_label] = value
        current_label = None
        current_lines = []

    for line in body_lines:
        match = SECTION_RE.match(line)
        if match:
            flush()
            current_label = normalize_section_label(match.group(1))
            first_value = match.group(2).strip()
            current_lines = [first_value] if first_value else []
        elif current_label:
            current_lines.append(line)
        elif line:
            current_label = "Abstract"
            current_lines = [line]
    flush()
    return sections


def make_summary(sections):
    priority = ["Background and Aims", "Background", "Objective", "Objectives", "Purpose", "Methods", "Results", "Conclusion", "Conclusions", "Abstract"]
    pieces = [sections[label] for label in priority if label in sections]
    if not pieces:
        pieces = [value for label, value in sections.items() if label not in {"Authors", "Affiliations", "Disclosure", "Funding"}]
    return compact_text(" ".join(pieces), 900)


def record_from_block(block):
    title, authors, affiliation_lines, body_lines = split_front_matter(block["title_lines"] + block["content_lines"])
    sections = {}
    if authors:
        sections["Authors"] = authors
    if affiliation_lines:
        sections["Affiliations"] = "\n".join(affiliation_lines)
    sections.update(parse_sections(body_lines))

    abstract_text = " ".join(
        value for label, value in sections.items() if label not in {"Authors", "Affiliations", "Disclosure", "Funding"}
    )
    section_labels = list(sections.keys())
    display_date = block["display_date"]
    publish_date = ""
    date_match = re.search(r"June\s+(\d{1,2})\s+2026", display_date)
    if date_match:
        publish_date = f"2026-06-{int(date_match.group(1)):02d}"

    return {
        "uid": block["uid"],
        "content_id": block["uid"],
        "abstract_number": block["uid"],
        "poster_number": block["uid"],
        "title": title or "Untitled abstract",
        "summary": make_summary(sections) or "No abstract body was included in the extracted supplement text for this record.",
        "meeting": MEETING,
        "meeting_year": 2026,
        "meeting_theme": MEETING_THEME,
        "url": CONGRESS_URL,
        "source_pdf_url": ABSTRACT_BOOK_URL,
        "source_pdf_page": block["page"],
        "primary_person": compact_text(authors.split(";", 1)[0].split(",", 1)[0]) if authors else "",
        "authors": authors,
        "session_type": block["presentation_type"],
        "track": block["track"] or block["presentation_type"],
        "poster_board_number": block["uid"],
        "doi": PDF_DOI,
        "publish_date": publish_date,
        "display_date": display_date,
        "start_time": "",
        "stop_time": "",
        "session_time": display_date,
        "location": "Palexpo, Geneva, Switzerland",
        "topics": [block["track"]] if block["track"] else [],
        "keywords": [],
        "has_tables": False,
        "table_count": 0,
        "tables": [],
        "is_structured": any(label not in {"Authors", "Affiliations", "Abstract", "Disclosure", "Funding"} for label in section_labels),
        "has_images": False,
        "image_count": 0,
        "images": [],
        "word_count": len(abstract_text.split()) if abstract_text else 0,
        "section_labels": section_labels,
        "sections": sections,
    }


def option_counts(records, key):
    counts = Counter(record[key] or "Unspecified" for record in records)
    return [{"name": name, "count": count} for name, count in counts.most_common()]


def write_outputs(records, pdf_page_count):
    payload = {
        "artifact_type": "ean_2026_abstract_archive",
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "source": {
            "conference_url": CONGRESS_URL,
            "abstract_book_url": ABSTRACT_BOOK_URL,
            "local_pdf": SOURCE_PDF.name,
            "journal_doi": PDF_DOI,
        },
        "meeting": {
            "name": MEETING,
            "short_name": MEETING_SHORT,
            "theme": MEETING_THEME,
            "dates": "27-30 June 2026",
            "location": "Palexpo, Geneva, Switzerland",
        },
        "record_count": len(records),
        "source_record_count": len(records),
        "filter": {
            "description": (
                "Includes oral presentation, ePoster, and ePosters Virtual records parsed from the "
                "European Journal of Neurology Volume 33 Supplement 1 abstract book for the 12th "
                "Congress of the European Academy of Neurology."
            ),
            "included_record_count": len(records),
            "excluded_record_count": 0,
        },
        "extraction_summary": {
            "pdf_pages": pdf_page_count,
            "oral_presentation_records": sum(1 for record in records if record["abstract_number"].startswith("OPR-")),
            "eposter_records": sum(1 for record in records if record["abstract_number"].startswith("EPO-")),
            "virtual_eposter_records": sum(1 for record in records if record["abstract_number"].startswith("EPV-")),
            "records_with_structured_sections": sum(1 for record in records if record["is_structured"]),
        },
        "limitations": [
            "The source abstract book is a two-column journal supplement PDF; section text is reconstructed from extracted PDF text.",
            "Figures and tables are not rendered as images in this static archive, although figure-caption text may appear in the source PDF.",
            "Some ePosters Virtual entries in the supplement expose title, author, and affiliation metadata without structured abstract bodies.",
        ],
        "tracks": option_counts(records, "track"),
        "session_types": option_counts(records, "session_type"),
        "abstracts": records,
    }

    FULL_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def main():
    lines, pdf_page_count = collect_lines()
    blocks = block_records(lines)
    records = [record_from_block(block) for block in blocks]
    if len(records) < 1900:
        print(f"Expected at least 1900 EAN abstract records, found {len(records)}", file=sys.stderr)
        sys.exit(1)
    write_outputs(records, pdf_page_count)
    print(f"Wrote {TARGET.relative_to(ROOT)} with {len(records)} EAN 2026 abstract records")


if __name__ == "__main__":
    main()
