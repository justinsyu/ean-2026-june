const DATA_URL = "assets/data/abstracts-index.json?v=ean-abstracts-20260628-2";
const ABSTRACT_BOOK_PDF_URL = "https://www.ean.org/fileadmin/user_upload/ean/Congress-2026/Abstracts/ENE_v33_iS1_Congress_Abstract_Book.pdf";

const state = {
  dataPromise: null,
  data: null,
  recordMap: new Map(),
};

const elements = {};

function trackEvent(name, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, {
    site_section: "kol_questions",
    ...params,
  });
}

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

function metadata(record) {
  return [
    record.abstract_number ? { label: "Abstract number", value: record.abstract_number } : null,
    record.primary_person ? { label: "First author", value: record.primary_person, format: "author" } : null,
    record.track ? { label: "Topic", value: record.track } : null,
    record.display_date ? { label: "Presentation date", value: record.display_date } : null,
  ].filter(Boolean);
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

function renderTable(table) {
  const rows = table.rows || [];
  if (!rows.length) return "";
  const [headerRow, ...bodyRows] = rows;
  const caption = table.caption || `Extracted table ${table.table_index || ""}`.trim();
  return `
    <section class="abstract-table-section">
      <h3>${escapeHtml(caption)}</h3>
      <div class="abstract-table-frame">
        <table>
          <thead>
            <tr>${headerRow.map((cell) => `<th scope="col">${escapeHtml(cell)}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${bodyRows
              .map(
                (row) => `
                  <tr>
                    ${row
                      .map((cell, index) =>
                        index === 0
                          ? `<th scope="row">${escapeHtml(cell)}</th>`
                          : `<td>${escapeHtml(cell)}</td>`,
                      )
                      .join("")}
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      ${table.footer ? `<p class="table-footnote">${escapeHtml(table.footer)}</p>` : ""}
    </section>
  `;
}

function tablesMarkup(record) {
  const tables = record.tables || [];
  if (!tables.length) return "";
  return `
    <section class="abstract-tables" aria-labelledby="tables-heading">
      <h2 id="tables-heading">Extracted tables</h2>
      ${tables.map(renderTable).join("")}
    </section>
  `;
}

function figuresMarkup(record) {
  const images = record.images || [];
  if (!images.length) return "";
  return `
    <section class="abstract-figures" aria-labelledby="figures-heading">
      <h2 id="figures-heading">Figures</h2>
      <div class="abstract-figure-grid">
        ${images
          .map(
            (image, index) => `
              <figure>
                <a href="${escapeHtml(image.source_url || image.url)}" target="_blank" rel="noopener">
                  <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || `Abstract figure ${index + 1}`)}" loading="lazy">
                </a>
                <figcaption>${escapeHtml(image.alt || `Figure ${index + 1}`)}</figcaption>
              </figure>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function abstractBookUrl(record) {
  const page = Number(record.source_pdf_page);
  if (Number.isFinite(page) && page > 0) return `${ABSTRACT_BOOK_PDF_URL}#page=${page}`;
  return record.source_pdf_url || "";
}

function addRecordToMap(record) {
  [record.uid, record.abstract_number, record.content_id, record.poster_number]
    .map((value) => text(value).trim().toUpperCase())
    .filter(Boolean)
    .forEach((id) => state.recordMap.set(id, record));
}

async function loadData() {
  if (!state.dataPromise) {
    state.dataPromise = fetch(DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load abstract data (${response.status})`);
        return response.json();
      })
      .then((data) => {
        state.data = data;
        state.recordMap = new Map();
        (data.abstracts || []).forEach(addRecordToMap);
        return data;
      });
  }
  return state.dataPromise;
}

function renderMissingRecord(id) {
  elements.dialogContent.innerHTML = `
    <header class="document-header dialog-header">
      <p class="eyebrow">Abstract detail</p>
      <h1 id="dialog-title">Abstract not found</h1>
      <p class="document-provenance">The local archive data did not include ${escapeHtml(id)}.</p>
    </header>
  `;
  elements.dialog.showModal();
}

function renderDetail(record) {
  const parts = metadata(record);
  const pdfUrl = abstractBookUrl(record);
  elements.dialogContent.innerHTML = `
    <header class="document-header dialog-header">
      <p class="eyebrow">${escapeHtml(record.meeting || "12th Congress of the European Academy of Neurology - Geneva 2026")}</p>
      <h1 id="dialog-title">${escapeHtml(record.title || "Untitled abstract")}</h1>
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
        ${
          record.doi
            ? `
              <div>
                <dt>DOI</dt>
                <dd>${escapeHtml(record.doi)}</dd>
              </div>
            `
            : ""
        }
      </dl>
      <div class="document-actions">
        ${pdfUrl ? `<a class="button button-primary" href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener">View abstract book</a>` : ""}
        ${record.url ? `<a class="button button-secondary" href="${escapeHtml(record.url)}" target="_blank" rel="noopener">View planner</a>` : ""}
      </div>
    </header>
    <div class="content abstract-detail-content">
      ${sectionMarkup(record)}
      ${figuresMarkup(record)}
      ${tablesMarkup(record)}
    </div>
  `;
  elements.dialog.showModal();
}

async function openDetail(id) {
  const normalizedId = text(id).trim().toUpperCase();
  await loadData();
  const record = state.recordMap.get(normalizedId);
  if (!record) {
    renderMissingRecord(normalizedId);
    return;
  }
  trackEvent("abstract_open", {
    abstract_id: record.uid,
    abstract_number: record.abstract_number || "",
    source_context: "kol_questions",
  });
  renderDetail(record);
}

function bindEvents() {
  document.querySelector(".kol-table-frame")?.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-abstract-id]");
    if (!link) return;
    event.preventDefault();
    openDetail(link.dataset.abstractId).catch((error) => {
      elements.dialogContent.innerHTML = `
        <header class="document-header dialog-header">
          <p class="eyebrow">Abstract detail</p>
          <h1 id="dialog-title">Unable to load abstract</h1>
          <p class="document-provenance">${escapeHtml(error.message)}</p>
        </header>
      `;
      elements.dialog.showModal();
    });
  });

  elements.dialog.querySelector(".dialog-close").addEventListener("click", () => elements.dialog.close());
  elements.dialog.addEventListener("click", (event) => {
    if (event.target.id === "abstract-dialog") event.target.close();
  });
}

function init() {
  elements.dialog = document.querySelector("#abstract-dialog");
  elements.dialogContent = document.querySelector("#dialog-content");
  if (!elements.dialog || !elements.dialogContent) return;
  bindEvents();
  loadData().catch(() => {
    // The click handler surfaces the error if a reader opens a detail before data loads.
  });
}

document.addEventListener("DOMContentLoaded", init);
