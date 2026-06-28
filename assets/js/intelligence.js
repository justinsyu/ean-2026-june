const DATA_URL = "assets/data/abstracts-index.json?v=ean-intelligence-20260628-3";
const PAGE_SIZE = 80;

const colors = {
  blue: "#007dc6",
  navy: "#181a33",
  lavender: "#c18ebd",
  teal: "#66c2cc",
  orange: "#f39200",
  green: "#99c221",
  gray: "#72727b",
};

const palette = [colors.blue, colors.lavender, colors.teal, colors.orange, colors.green, colors.navy, colors.gray];

const definitions = {
  themes: [
    ["Multiple sclerosis and neuroimmunology", ["multiple sclerosis", "ms", "neuroimmunology", "demyelinating", "demyelination", "myelin", "optic neuritis", "nmosd", "mogad", "autoimmune"]],
    ["Stroke and cerebrovascular disease", ["stroke", "ischaemic", "ischemic", "intracerebral", "hemorrhage", "haemorrhage", "cerebrovascular", "thrombectomy", "recanalization", "small vessel"]],
    ["Movement disorders and Parkinson's disease", ["parkinson", "movement disorder", "dyskinesia", "tremor", "dystonia", "levodopa", "basal ganglia", "ataxia"]],
    ["Dementia and cognitive neurology", ["dementia", "alzheimer", "cognitive", "memory", "mild cognitive", "amyloid", "tau", "frontotemporal", "lewy body"]],
    ["Epilepsy and seizure disorders", ["epilepsy", "seizure", "status epilepticus", "antiepileptic", "antiseizure", "eeg", "ictal"]],
    ["Headache, pain, and migraine", ["headache", "migraine", "pain", "trigeminal", "cgrp", "neuralgia", "nociceptive"]],
    ["Neuromuscular and peripheral nerve disorders", ["neuromuscular", "myasthenia", "myopathy", "neuropathy", "peripheral nerve", "als", "motor neurone", "motor neuron", "muscular dystrophy"]],
    ["Neuro-oncology and CNS tumors", ["glioma", "glioblastoma", "neuro-oncology", "tumor", "tumour", "metastasis", "meningioma", "idh-mutant"]],
    ["Neurorehabilitation and digital function", ["rehabilitation", "neurorehabilitation", "gait", "wearable", "digital", "virtual reality", "robotic", "mobility"]],
    ["Sleep-wake and autonomic disorders", ["sleep", "insomnia", "narcolepsy", "circadian", "autonomic", "orthostatic", "syncope", "dysautonomia"]],
    ["Infectious, systemic, and inflammatory neurology", ["infection", "infectious", "covid", "post-covid", "systemic", "inflammation", "encephalitis", "meningitis", "dengue"]],
    ["AI, imaging, and computational neurology", ["artificial intelligence", "machine learning", "deep learning", "algorithm", "predictive model", "neuroimaging", "mri", "fmri", "digital biomarker"]],
  ],
  methods: [
    ["Clinical trials", ["phase 1", "phase i", "phase 2", "phase ii", "phase 3", "phase iii", "randomized", "randomised", "double blind", "placebo", "trial", "open label"]],
    ["Observational and registry studies", ["real world", "real-world", "registry", "cohort", "database", "retrospective", "prospective", "case-control", "population-based"]],
    ["Machine learning and AI", ["machine learning", "deep learning", "artificial intelligence", "algorithm", "predictive model", "natural language processing"]],
    ["Neuroimaging and electrophysiology", ["fmri", "functional magnetic resonance", "mri", "pet", "spect", "eeg", "emg", "nerve conduction", "connectivity", "network"]],
    ["Patient-reported and functional outcomes", ["patient reported", "patient-reported", "quality of life", "qol", "scale", "questionnaire", "disability", "edss", "moca"]],
    ["Safety and tolerability", ["safety", "tolerability", "adverse event", "adverse events", "treatment emergent"]],
  ],
  phases: [
    ["Phase 1", ["phase 1", "phase i", "phase ib"]],
    ["Phase 2", ["phase 2", "phase ii", "phase iib"]],
    ["Phase 3", ["phase 3", "phase iii"]],
    ["Open-label", ["open label", "open-label"]],
    ["Randomized", ["randomized", "randomised"]],
  ],
  sources: [
    ["Registry / EHR / database", ["electronic health record", "ehr", "registry", "database", "real world data", "claims"]],
    ["CSF / plasma / blood", ["csf", "cerebrospinal", "plasma", "blood", "serum"]],
    ["Imaging / EEG / EMG", ["fmri", "mri", "pet", "eeg", "emg", "neuroimaging", "ultrasound"]],
    ["Genetic / genomic", ["genetic", "genomic", "gene", "polygenic", "sequencing"]],
    ["Wearables / sensors", ["wearable", "sensor", "smartphone", "passive sensing", "actigraphy"]],
    ["Surveys / scales", ["survey", "questionnaire", "scale", "rating scale", "patient reported"]],
  ],
  treatments: [
    ["Disease-modifying MS therapies", ["ocrelizumab", "ofatumumab", "natalizumab", "fingolimod", "siponimod", "cladribine", "teriflunomide", "dimethyl fumarate", "b-cell", "dmt"]],
    ["Acute stroke and antithrombotic care", ["thrombolysis", "thrombectomy", "alteplase", "tenecteplase", "anticoagulant", "antiplatelet", "recanalization"]],
    ["Antiseizure medications", ["antiseizure", "antiepileptic", "levetiracetam", "valproate", "lamotrigine", "lacosamide", "carbamazepine"]],
    ["Parkinson and movement-disorder therapy", ["levodopa", "dopamine", "opicapone", "deep brain stimulation", "dbs", "duodopa", "apomorphine", "botulinum"]],
    ["Migraine and pain therapies", ["cgrp", "erenumab", "fremanezumab", "galcanezumab", "onabotulinumtoxin", "triptan", "gepants"]],
    ["Immunotherapy and biologics", ["immunotherapy", "monoclonal", "rituximab", "eculizumab", "steroid", "intravenous immunoglobulin", "ivig", "plasma exchange"]],
    ["Gene, RNA, and advanced therapies", ["gene therapy", "antisense", "rna", "sirna", "oligonucleotide", "viral vector", "stem cell"]],
    ["Digital and rehabilitation interventions", ["rehabilitation", "neurorehabilitation", "digital intervention", "virtual reality", "robot", "exercise", "training"]],
  ],
  biomarkers: [
    ["Neurofilament / GFAP", ["neurofilament", "nfl", "gfap", "glial fibrillary"]],
    ["Tau / amyloid / AD biomarkers", ["tau", "amyloid", "ptau", "p-tau", "alzheimer"]],
    ["CSF and inflammatory markers", ["csf", "cerebrospinal", "cytokine", "inflammation", "inflammatory", "oligoclonal"]],
    ["Imaging markers", ["mri", "pet", "lesion", "atrophy", "connectivity", "diffusion", "perfusion"]],
    ["Genetics / genomics", ["genetic", "genomic", "gene", "variant", "polygenic", "sequencing"]],
    ["Digital biomarkers", ["wearable", "sensor", "digital biomarker", "gait", "actigraphy", "smartphone"]],
  ],
};

const focusCards = [
  ["Digital neurology and AI", definitions.themes[11][1], "Abstracts using AI, machine learning, imaging algorithms, digital biomarkers, or computational neurology methods."],
  ["MS and neuroimmunology", definitions.themes[0][1], "Abstracts centered on multiple sclerosis, demyelinating disease, neuroimmunology, and immune-mediated neurology."],
  ["Translational biomarkers", definitions.biomarkers.flatMap((item) => item[1]), "CSF, blood, imaging, genetics, neurofilament, GFAP, amyloid, tau, and digital-biomarker work."],
];

const fieldViews = [
  {
    label: "Narrative-shifting evidence candidates",
    description: "Structured oral, trial, safety, efficacy, or biomarker records that may warrant manual review for message impact.",
    records: () => app.records.filter((record) =>
      record.is_structured &&
      (record.session_type === "Oral Presentation" || matchTerms(record, definitions.methods[0][1])) &&
      matchTerms(record, ["efficacy", "effective", "significant", "improved", "reduced", "safety", "tolerability", "biomarker", "neurofilament", "gfap"]),
    ),
  },
  {
    label: "Trial-connected and late-stage signals",
    description: "Records mentioning randomized designs, explicit phases, open-label studies, trial identifiers, or registry language.",
    records: () => recordsForTerms(["phase 2", "phase ii", "phase 3", "phase iii", "randomized", "randomised", "open-label", "open label", "nct", "clinicaltrials.gov", "trial registration"]),
  },
  {
    label: "Endpoint and outcomes map",
    description: "Records using endpoints, scales, disability measures, patient-reported outcomes, cognition, quality of life, or functional measures.",
    records: () => recordsForTerms(["endpoint", "outcome", "scale", "edss", "updrs", "moca", "quality of life", "patient reported", "patient-reported", "disability", "gait", "cognition"]),
  },
  {
    label: "Emerging biomarker and mechanism signals",
    description: "Biomarker, imaging, genetic, inflammatory, and mechanism-oriented abstracts for translational review.",
    records: () => unionRecords([recordsForTerms(definitions.biomarkers.flatMap((item) => item[1])), recordsForTerms(["mechanism", "pathway", "target", "phenotype", "endotype"])]),
  },
  {
    label: "Digital care and workflow signals",
    description: "AI, imaging algorithms, wearables, remote monitoring, rehabilitation technology, and workflow-support records.",
    records: () => unionRecords([recordsForTerms(definitions.themes[8][1]), recordsForTerms(definitions.themes[11][1]), recordsForTerms(["remote monitoring", "telemedicine", "workflow", "decision support", "app", "digital intervention"])]),
  },
  {
    label: "Repeated author activity",
    description: "Abstracts from authors with at least three EAN 2026 records, useful for identifying recurring congress contributors.",
    records: () => {
      const repeated = new Set((app.data.author_profiles || []).filter((profile) => profile.record_count >= 3).flatMap((profile) => profile.abstract_uids));
      return app.records.filter((record) => repeated.has(record.uid));
    },
  },
];

const app = {
  data: null,
  records: [],
  charts: [],
  selectedRecords: [],
  rendered: 0,
};

function text(value) {
  return value == null ? "" : String(value);
}

function escapeHtml(value) {
  return text(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatAuthorMarkers(value) {
  return text(value)
    .split(";")
    .map((part) => {
      const trimmed = part.trim();
      const match = trimmed.match(/^(.*?)(\d+(?:,\d+)*)$/);
      if (!match) return escapeHtml(trimmed);
      return `${escapeHtml(match[1].trim())}<sup>${escapeHtml(match[2])}</sup>`;
    })
    .filter(Boolean)
    .join("; ");
}

function formatAffiliations(value) {
  const entries = text(value).split(/;\s*(?=\d+[A-Za-z])/);
  return entries
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return "";
      const match = trimmed.match(/^(\d+)(.*)$/s);
      if (!match) return `<p class="affiliation-line">${escapeHtml(trimmed)}</p>`;
      return `<p class="affiliation-line"><sup>${escapeHtml(match[1])}</sup>${escapeHtml(match[2].trim())}</p>`;
    })
    .filter(Boolean)
    .join("");
}

function sectionClassName(label) {
  const normalized = text(label).toLowerCase();
  if (normalized === "authors") return "abstract-section section-authors";
  if (normalized === "affiliations") return "abstract-section section-affiliations";
  return "abstract-section";
}

function sectionBodyMarkup(label, value) {
  const normalized = text(label).toLowerCase();
  if (normalized === "authors") return `<p>${formatAuthorMarkers(value)}</p>`;
  if (normalized === "affiliations") return `<div class="affiliation-list">${formatAffiliations(value)}</div>`;
  return `<p>${escapeHtml(value)}</p>`;
}

function normalize(value) {
  return text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function recordText(record) {
  if (!record._intelText) {
    record._intelText = normalize([
      record.abstract_number,
      record.title,
      record.summary,
      record.authors,
      record.primary_person,
      record.session_type,
      record.track,
      Object.keys(record.sections || {}).join(" "),
      Object.values(record.sections || {}).join(" "),
    ].join(" "));
  }
  return record._intelText;
}

function termMatches(haystack, term) {
  const needle = normalize(term);
  if (!needle) return false;
  return new RegExp(`(^| )${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}( |$)`).test(haystack);
}

function matchTerms(record, terms) {
  const haystack = recordText(record);
  return terms.some((term) => termMatches(haystack, term));
}

function recordsForTerms(terms) {
  return app.records.filter((record) => matchTerms(record, terms));
}

function unionRecords(groups) {
  const seen = new Map();
  groups.flat().forEach((record) => seen.set(record.uid, record));
  return [...seen.values()];
}

function countDefinitions(items) {
  return items.map(([label, terms]) => ({ label, terms, records: recordsForTerms(terms) }));
}

function groupRecords(keyFn) {
  const grouped = new Map();
  app.records.forEach((record) => {
    const key = keyFn(record);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(record);
  });
  return [...grouped.entries()].map(([label, records]) => ({ label, records }));
}

function metadata(record) {
  return [
    record.abstract_number ? { label: "Abstract number", value: record.abstract_number } : null,
    record.primary_person ? { label: "First author", value: record.primary_person, format: "author" } : null,
    record.track ? { label: "Topic", value: record.track } : null,
    record.display_date ? { label: "Presentation date", value: record.display_date } : null,
  ].filter(Boolean);
}

function sourceLabel(record) {
  return metadata(record).map((part) => part.value).join(" / ");
}

function kpiButton(label, records) {
  const button = document.createElement("button");
  button.className = "kpi";
  button.type = "button";
  button.innerHTML = `<div class="num">${numberFormat(records.length)}</div><div class="label">${escapeHtml(label)}</div>`;
  button.addEventListener("click", () => openRecords("Metric", label, records));
  return button;
}

function renderKpis() {
  const structured = app.records.filter((record) => record.is_structured);
  const ai = recordsForTerms(definitions.themes[11][1]);
  const trials = recordsForTerms(definitions.methods[0][1]);
  const biomarkers = recordsForTerms(definitions.biomarkers.flatMap((item) => item[1]));
  const safety = recordsForTerms(["safety", "tolerability", "adverse event", "adverse events", "mortality", "death"]);
  document.querySelector("#kpi-grid").append(
    kpiButton("Total abstract records", app.records),
    kpiButton("Structured records", structured),
    kpiButton("AI / imaging / digital", ai),
    kpiButton("Clinical trial signal", trials),
    kpiButton("Biomarker signal", biomarkers),
    kpiButton("Safety signal", safety),
  );
}

function renderInsights() {
  const insights = [
    ["Multiple sclerosis and neuroimmunology form a major corpus thread", recordsForTerms(definitions.themes[0][1])],
    ["Stroke and cerebrovascular disease are broad across records", recordsForTerms(definitions.themes[1][1])],
    ["Movement disorders and Parkinson's disease are prominent", recordsForTerms(definitions.themes[2][1])],
    ["Clinical-trial language appears across therapeutic areas", recordsForTerms(definitions.methods[0][1])],
    ["Biomarker and translational-measurement work is a major evidence thread", recordsForTerms(definitions.biomarkers.flatMap((item) => item[1]))],
    ["AI, imaging, wearables, and digital biomarkers mark computational neurology work", unionRecords([recordsForTerms(definitions.themes[8][1]), recordsForTerms(definitions.themes[11][1]), recordsForTerms(definitions.biomarkers[5][1])])],
  ];
  document.querySelector("#insight-list").innerHTML = insights
    .map(
      ([label, records], index) => `
        <li><button type="button" data-insight="${index}"><strong>${escapeHtml(label)}</strong>: ${numberFormat(records.length)} matching abstracts</button></li>
      `,
    )
    .join("");
  document.querySelector("#insight-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-insight]");
    if (!button) return;
    const [label, records] = insights[Number(button.dataset.insight)];
    openRecords("Insight", label, records);
  });
}

function renderBarList(id, points, kind) {
  const max = Math.max(...points.map((point) => point.records.length), 1);
  const container = document.querySelector(`#${id}`);
  if (!container) return;
  container.innerHTML = "";
  points.forEach((point, index) => {
    const button = document.createElement("button");
    button.className = "bar-item";
    button.type = "button";
    button.innerHTML = `
      <span class="name">${escapeHtml(point.label)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${Math.max(2, (point.records.length / max) * 100).toFixed(1)}%; background:${palette[index % palette.length]}"></span></span>
      <span class="val">${numberFormat(point.records.length)}</span>
    `;
    button.addEventListener("click", () => openRecords(kind, point.label, point.records));
    container.append(button);
  });
}

function chartClickHandler(points, kind) {
  return (_event, elements) => {
    if (!elements.length) return;
    const point = points[elements[0].index];
    openRecords(kind, point.label, point.records);
  };
}

function renderChart(canvasId, type, points, kind, extra = {}) {
  const chart = new Chart(document.getElementById(canvasId), {
    type,
    data: {
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: "Matching abstracts",
          data: points.map((point) => point.records.length),
          backgroundColor: points.map((_, index) => palette[index % palette.length]),
          borderColor: type === "doughnut" ? "#ffffff" : "transparent",
          borderWidth: type === "doughnut" ? 2 : 0,
          borderRadius: type === "bar" ? 4 : 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: extra.indexAxis || "x",
      interaction: { mode: "nearest", intersect: false },
      onClick: chartClickHandler(points, kind),
      plugins: {
        legend: { display: extra.legend !== false && type !== "bar", position: "bottom", labels: { color: colors.gray, boxWidth: 10, font: { size: 10 } } },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${numberFormat(context.parsed.y ?? context.parsed.x ?? context.parsed)} abstracts`,
          },
        },
      },
      cutout: extra.cutout || (type === "doughnut" ? "54%" : undefined),
      radius: extra.radius,
      scales: type === "doughnut" ? undefined : {
        x: { grid: { color: extra.indexAxis === "y" ? "#e7e7e7" : "transparent" }, ticks: { color: colors.gray, font: { size: 10 } } },
        y: { grid: { color: extra.indexAxis === "y" ? "transparent" : "#e7e7e7" }, ticks: { color: colors.gray, font: { size: 10 } } },
      },
    },
  });
  app.charts.push(chart);
  attachPointButtons(canvasId, points, kind);
}

function attachPointButtons(canvasId, points, kind) {
  const card = document.getElementById(canvasId).closest(".card");
  const pills = document.createElement("div");
  pills.className = "point-pills";
  points.forEach((point) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${point.label} (${numberFormat(point.records.length)})`;
    button.addEventListener("click", () => openRecords(kind, point.label, point.records));
    pills.append(button);
  });
  card.append(pills);
}

function renderFocusCards() {
  const container = document.querySelector("#focus-cards");
  focusCards.forEach(([label, terms, description]) => {
    const records = recordsForTerms(terms);
    const button = document.createElement("button");
    button.className = "focus-card";
    button.type = "button";
    button.innerHTML = `<h3>${escapeHtml(label)}</h3><div class="big">${numberFormat(records.length)}</div><p>${escapeHtml(description)}</p>`;
    button.addEventListener("click", () => openRecords("Focused view", label, records));
    container.append(button);
  });
}

function recordsFromUids(uids) {
  const recordByUid = new Map(app.records.map((record) => [record.uid, record]));
  return (uids || []).map((uid) => recordByUid.get(uid)).filter(Boolean);
}

function profileSummary(profile, key) {
  return (profile[key] || []).slice(0, 2).map((item) => item.name).join(" / ");
}

function renderProfileList(id, profiles, kind, summaryKey) {
  const container = document.querySelector(`#${id}`);
  if (!container) return;
  container.innerHTML = "";
  (profiles || []).slice(0, 10).forEach((profile) => {
    const records = recordsFromUids(profile.abstract_uids);
    const button = document.createElement("button");
    button.className = "profile-item";
    button.type = "button";
    button.innerHTML = `
      <span class="profile-main">
        <span class="profile-name">${escapeHtml(profile.name)}</span>
        <span class="profile-detail">${escapeHtml(profileSummary(profile, summaryKey) || "No dominant category")}</span>
      </span>
      <span class="profile-count">${numberFormat(profile.record_count)}</span>
    `;
    button.addEventListener("click", () => openRecords(kind, profile.name, records));
    container.append(button);
  });
}

function renderFieldCards() {
  const container = document.querySelector("#field-cards");
  if (!container) return;
  fieldViews.forEach((view) => {
    const records = view.records();
    const button = document.createElement("button");
    button.className = "focus-card";
    button.type = "button";
    button.innerHTML = `<h3>${escapeHtml(view.label)}</h3><div class="big">${numberFormat(records.length)}</div><p>${escapeHtml(view.description)}</p>`;
    button.addEventListener("click", () => openRecords("Field intelligence view", view.label, records));
    container.append(button);
  });
}

function openRecords(kind, label, records) {
  app.selectedRecords = [...records].sort((a, b) => String(a.abstract_number).localeCompare(String(b.abstract_number), undefined, { numeric: true }));
  app.rendered = 0;
  document.querySelector("#dialog-kind").textContent = kind;
  document.querySelector("#dialog-title").textContent = label;
  document.querySelector("#dialog-summary").textContent = `${numberFormat(app.selectedRecords.length)} matching abstracts. Use View details to open the section-preserving abstract popup.`;
  document.querySelector("#dialog-search").value = "";
  renderRecords(true);
  document.querySelector("#records-dialog").showModal();
}

function filteredSelectedRecords() {
  const query = normalize(document.querySelector("#dialog-search").value);
  if (!query) return app.selectedRecords;
  const terms = query.split(/\s+/).filter(Boolean);
  return app.selectedRecords.filter((record) => terms.every((term) => recordText(record).includes(term)));
}

function renderRecords(reset = false) {
  if (reset) app.rendered = 0;
  const records = filteredSelectedRecords();
  app.rendered = Math.min(records.length, app.rendered + PAGE_SIZE);
  document.querySelector("#records-list").innerHTML = records
    .slice(0, app.rendered)
    .map(
      (record) => `
        <li>
          <a class="record-title" href="${escapeHtml(record.source_pdf_url || record.url)}" target="_blank" rel="noopener">${escapeHtml(record.title || "Untitled abstract")}</a>
          <div class="record-meta">${escapeHtml(sourceLabel(record))}</div>
          <p class="record-summary">${escapeHtml(record.summary || "No summary available.")}</p>
          <div class="record-actions">
            <button class="button button-primary" type="button" data-detail-uid="${escapeHtml(record.uid)}">View details</button>
            <a class="button button-secondary" href="${escapeHtml(record.source_pdf_url || record.url)}" target="_blank" rel="noopener">Source</a>
          </div>
        </li>
      `,
    )
    .join("");
  const loadMore = document.querySelector("#load-more-records");
  loadMore.hidden = app.rendered >= records.length;
  loadMore.textContent = `Load more (${numberFormat(records.length - app.rendered)} remaining)`;
}

function sectionMarkup(record) {
  const entries = Object.entries(record.sections || {});
  if (!entries.length) {
    return '<p class="lead">No section-level abstract text was extracted for this record.</p>';
  }
  return entries
    .map(
      ([label, value]) => `
        <section class="${sectionClassName(label)}">
          <h3>${escapeHtml(label)}</h3>
          ${sectionBodyMarkup(label, value)}
        </section>
      `,
    )
    .join("");
}

function openDetail(uid) {
  const record = app.records.find((item) => item.uid === uid);
  if (!record) return;
  const parts = metadata(record);
  document.querySelector("#abstract-dialog-content").innerHTML = `
    <header class="document-header dialog-header">
      <p class="eyebrow">${escapeHtml(record.meeting || "12th Congress of the European Academy of Neurology - Geneva 2026")}</p>
      <h1 id="abstract-dialog-title">${escapeHtml(record.title || "Untitled abstract")}</h1>
      <dl class="metadata">
        ${parts
          .map(
            (part) => `
              <div>
                <dt>${escapeHtml(part.label)}</dt>
                <dd>${part.format === "author" ? formatAuthorMarkers(part.value) : escapeHtml(part.value)}</dd>
              </div>
            `,
          )
          .join("")}
      </dl>
      <div class="document-actions">
        ${record.source_pdf_url ? `<a class="button button-primary" href="${escapeHtml(record.source_pdf_url)}" target="_blank" rel="noopener">View abstract book</a>` : ""}
        ${record.url ? `<a class="button button-secondary" href="${escapeHtml(record.url)}" target="_blank" rel="noopener">View planner</a>` : ""}
      </div>
    </header>
    <div class="content abstract-detail-content">
      ${sectionMarkup(record)}
    </div>
  `;
  document.querySelector("#abstract-dialog").showModal();
}

function wireDialogs() {
  document.querySelector("#records-dialog .dialog-close").addEventListener("click", () => document.querySelector("#records-dialog").close());
  document.querySelector("#abstract-dialog .dialog-close").addEventListener("click", () => document.querySelector("#abstract-dialog").close());
  document.querySelector("#records-dialog").addEventListener("click", (event) => {
    if (event.target.id === "records-dialog") event.target.close();
    const detail = event.target.closest("[data-detail-uid]");
    if (detail) openDetail(detail.dataset.detailUid);
  });
  document.querySelector("#abstract-dialog").addEventListener("click", (event) => {
    if (event.target.id === "abstract-dialog") event.target.close();
  });
  document.querySelector("#dialog-search").addEventListener("input", () => renderRecords(true));
  document.querySelector("#load-more-records").addEventListener("click", () => renderRecords());
  document.querySelector("#copy-urls").addEventListener("click", async () => {
    const urls = filteredSelectedRecords().map((record) => record.source_pdf_url || record.url).filter(Boolean).join("\n");
    await navigator.clipboard.writeText(urls);
    document.querySelector("#copy-urls").textContent = "Copied";
    setTimeout(() => {
      document.querySelector("#copy-urls").textContent = "Copy URLs";
    }, 1200);
  });
}

function renderAll() {
  renderKpis();
  renderInsights();
  renderChart("sessionChart", "doughnut", groupRecords((record) => record.track || "Unspecified"), "Topic", { legend: false, cutout: "46%", radius: "100%" });

  renderChart("themeChart", "bar", countDefinitions(definitions.themes), "Clinical theme", { indexAxis: "y" });
  renderChart("methodChart", "doughnut", countDefinitions(definitions.methods), "Method");
  renderChart("phaseChart", "bar", countDefinitions(definitions.phases), "Trial phase");
  renderBarList("sourceBars", countDefinitions(definitions.sources).sort((a, b) => b.records.length - a.records.length), "Data source");
  renderBarList("treatmentBars", countDefinitions(definitions.treatments).sort((a, b) => b.records.length - a.records.length), "Treatment signal");
  renderBarList("biomarkerBars", countDefinitions(definitions.biomarkers).sort((a, b) => b.records.length - a.records.length), "Biomarker signal");
  renderFocusCards();
  renderProfileList("authorProfiles", app.data.author_profiles, "Author activity", "tracks");
  renderProfileList("institutionProfiles", app.data.institution_profiles, "Institution activity", "tracks");
  renderFieldCards();
}

function markLoaded() {
  document.querySelector("#dashboard-loading")?.setAttribute("hidden", "");
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-loaded");
}

async function start() {
  wireDialogs();
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
  app.data = await response.json();
  app.records = app.data.abstracts || [];
  renderAll();
  requestAnimationFrame(markLoaded);
}

start().catch((error) => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("has-load-error");
  document.querySelector("#dashboard-loading")?.setAttribute("hidden", "");
  document.querySelector(".dashboard-shell").insertAdjacentHTML(
    "afterbegin",
    `<section class="insight-box"><h2>Unable to load dashboard data</h2><p>${escapeHtml(error.message)}</p></section>`,
  );
});
