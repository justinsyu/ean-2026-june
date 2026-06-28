const DATA_URL = "assets/data/abstracts-index.json?v=ean-abstracts-20260628-2";
const INITIAL_LIMIT = 80;
const LIMIT_STEP = 80;

const state = {
  data: null,
  query: "",
  sessionType: "",
  track: "",
  tablesOnly: false,
  sort: "relevance",
  visibleLimit: INITIAL_LIMIT,
};

const elements = {};

function trackEvent(name, params = {}) {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", name, {
    site_section: "browse",
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

function safeFilename(value) {
  return text(value || "abstract")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "abstract";
}

function numberFormat(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function optionLabel(item) {
  return `${item.name} (${numberFormat(item.count)})`;
}

function initElements() {
  elements.search = document.querySelector("#search");
  elements.sessionFilter = document.querySelector("#session-filter");
  elements.trackFilter = document.querySelector("#track-filter");
  elements.sortFilter = document.querySelector("#sort-filter");
  elements.tableFilter = document.querySelector("#table-filter");
  elements.clearFilters = document.querySelector("#clear-filters");
  elements.resultCount = document.querySelector("#result-count");
  elements.results = document.querySelector("#results");
  elements.loadMore = document.querySelector("#load-more");
  elements.trackList = document.querySelector("#track-list");
  elements.sessionList = document.querySelector("#session-list");
  elements.dialog = document.querySelector("#abstract-dialog");
  elements.dialogContent = document.querySelector("#dialog-content");
}

function populateSelect(select, items) {
  const current = select.value;
  const options = items
    .map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(optionLabel(item))}</option>`)
    .join("");
  select.insertAdjacentHTML("beforeend", options);
  select.value = current;
}

function populateStats(data) {
  document.querySelector('[data-stat="records"]').textContent = numberFormat(data.record_count);
  document.querySelector('[data-stat="tracks"]').textContent = numberFormat(data.tracks.length);
  const structuredCount = data.abstracts.filter((record) => record.is_structured).length;
  document.querySelector('[data-stat="tables"]').textContent = numberFormat(structuredCount);
}

function renderAnalytics(list, items, maxItems = 12) {
  list.innerHTML = items
    .slice(0, maxItems)
    .map(
      (item) => `
        <li>
          <button class="topic-card-link analytics-button" type="button" data-filter-value="${escapeHtml(item.name)}">
            <span class="topic-card-title">${escapeHtml(item.name)}</span>
            <span class="topic-card-meta">${numberFormat(item.count)} abstracts</span>
          </button>
        </li>
      `,
    )
    .join("");
}

function recordMatches(record) {
  if (state.sessionType && record.session_type !== state.sessionType) return false;
  if (state.track && record.track !== state.track) return false;
  if (state.tablesOnly && !record.is_structured) return false;
  if (!state.query) return true;
  const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!record._searchText) {
    record._searchText = [
      record.abstract_number,
      record.title,
      record.summary,
      record.primary_person,
      record.session_type,
      record.track,
      Object.keys(record.sections || {}).join(" "),
      Object.values(record.sections || {}).join(" "),
      (record.tables || [])
        .map((table) => [table.caption, table.footer, ...(table.rows || []).flat()].join(" "))
        .join(" "),
    ]
      .join(" ")
      .toLowerCase();
  }
  return terms.every((term) => record._searchText.includes(term));
}

function compareRecords(a, b) {
  const collator = new Intl.Collator("en-US", { numeric: true, sensitivity: "base" });
  if (state.sort === "title") return collator.compare(a.title, b.title);
  if (state.sort === "abstract") return collator.compare(a.abstract_number, b.abstract_number);
  if (state.sort === "session") return collator.compare(a.session_type, b.session_type) || collator.compare(a.title, b.title);
  if (state.sort === "track") return collator.compare(a.track, b.track) || collator.compare(a.title, b.title);
  return 0;
}

function metadata(record) {
  return [
    record.abstract_number ? { label: "Abstract number", value: record.abstract_number } : null,
    record.primary_person ? { label: "First author", value: record.primary_person, format: "author" } : null,
    record.track ? { label: "Topic", value: record.track } : null,
    record.display_date ? { label: "Presentation date", value: record.display_date } : null,
  ].filter(Boolean);
}

function renderRecord(record) {
  const parts = metadata(record);
  return `
    <li>
      <article class="document-row-link abstract-row">
        <div class="document-row-chip">${escapeHtml(record.session_type)}</div>
        <div class="document-row-body">
          <h3 class="document-row-title">${escapeHtml(record.title || "Untitled abstract")}</h3>
          <p class="document-row-meta">
            ${parts.map((part) => `<span>${escapeHtml(part.value)}</span>`).join("")}
          </p>
          <p class="abstract-summary">${escapeHtml(record.summary || "No summary available.")}</p>
          <div class="abstract-actions">
            <button class="button button-primary" type="button" data-uid="${escapeHtml(record.uid)}">View details</button>
            ${record.source_pdf_url ? `<a class="button button-secondary" href="${escapeHtml(record.source_pdf_url)}" target="_blank" rel="noopener" data-source-uid="${escapeHtml(record.uid)}">View abstract book</a>` : ""}
          </div>
        </div>
      </article>
    </li>
  `;
}

function filteredRecords() {
  return state.data.abstracts.filter(recordMatches).sort(compareRecords);
}

function renderResults() {
  const records = filteredRecords();
  const visible = records.slice(0, state.visibleLimit);
  elements.resultCount.textContent = `${numberFormat(records.length)} matching abstract${records.length === 1 ? "" : "s"}`;
  elements.results.innerHTML = visible.map(renderRecord).join("");
  const remaining = Math.max(0, records.length - state.visibleLimit);
  elements.loadMore.hidden = remaining === 0;
  elements.loadMore.textContent = remaining ? `Load ${numberFormat(Math.min(LIMIT_STEP, remaining))} more` : "Load more results";
}

function syncStateFromControls() {
  state.query = elements.search.value.trim();
  state.sessionType = elements.sessionFilter.value;
  state.track = elements.trackFilter.value;
  state.tablesOnly = elements.tableFilter.checked;
  state.sort = elements.sortFilter.value;
  state.visibleLimit = INITIAL_LIMIT;
  renderResults();
}

function clearFilters() {
  elements.search.value = "";
  elements.sessionFilter.value = "";
  elements.trackFilter.value = "";
  elements.tableFilter.checked = false;
  elements.sortFilter.value = "relevance";
  syncStateFromControls();
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

function downloadRecordJson(record) {
  trackEvent("download_json", {
    abstract_id: record.uid,
    abstract_number: record.abstract_number || "",
    session_type: record.session_type || "",
    track: record.track || "",
  });
  const filenameBase = safeFilename(record.abstract_number || record.uid || record.title);
  const payload = {
    artifact_type: "ean_2026_single_abstract",
    created_at_utc: new Date().toISOString(),
    source: state.data.source,
    record,
  };
  const json = JSON.stringify(payload, (key, value) => (key.startsWith("_") ? undefined : value), 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ean-2026-${filenameBase}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function openDetail(uid) {
  const record = state.data.abstracts.find((item) => item.uid === uid);
  if (!record) return;
  trackEvent("abstract_open", {
    abstract_id: record.uid,
    abstract_number: record.abstract_number || "",
    session_type: record.session_type || "",
    track: record.track || "",
    has_images: Boolean(record.has_images),
    is_structured: Boolean(record.is_structured),
  });
  const parts = metadata(record);
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
        ${record.source_pdf_url ? `<a class="button button-primary" href="${escapeHtml(record.source_pdf_url)}" target="_blank" rel="noopener" data-source-uid="${escapeHtml(record.uid)}">View abstract book</a>` : ""}
        ${record.url ? `<a class="button button-secondary" href="${escapeHtml(record.url)}" target="_blank" rel="noopener" data-source-uid="${escapeHtml(record.uid)}">View planner</a>` : ""}
        <button class="button button-secondary" type="button" data-download-uid="${escapeHtml(record.uid)}">Download JSON</button>
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

function applyDeepLinkFromUrl() {
  // Allow external documents (e.g. company-insight reports) to deep-link to a
  // specific abstract via ?q=<term> or ?abstract=<ABSTRACT-NUMBER>. Prefills
  // the search box, applies the filter, and, when the term exactly matches one
  // abstract number, opens that abstract's detail dialog directly. No-op when
  // no parameter is present, so default page behavior is unchanged.
  const params = new URLSearchParams(window.location.search);
  const term = (params.get("q") || params.get("abstract") || "").trim();
  if (!term) return;
  elements.search.value = term;
  syncStateFromControls();
  const browse = document.querySelector("#browse");
  if (browse) browse.scrollIntoView({ behavior: "smooth", block: "start" });
  const exact = state.data.abstracts.filter(
    (record) => (record.abstract_number || "").toLowerCase() === term.toLowerCase(),
  );
  if (exact.length === 1) openDetail(exact[0].uid);
}

function bindEvents() {
  elements.search.addEventListener("input", syncStateFromControls);
  elements.sessionFilter.addEventListener("change", syncStateFromControls);
  elements.trackFilter.addEventListener("change", syncStateFromControls);
  elements.sortFilter.addEventListener("change", syncStateFromControls);
  elements.tableFilter.addEventListener("change", syncStateFromControls);
  elements.search.addEventListener("change", () => {
    trackEvent("search_used", {
      query_length: elements.search.value.trim().length,
      result_count: filteredRecords().length,
    });
  });
  elements.sessionFilter.addEventListener("change", () => {
    trackEvent("filter_used", {
      filter_type: "session_type",
      filter_value: elements.sessionFilter.value || "all",
      result_count: filteredRecords().length,
    });
  });
  elements.trackFilter.addEventListener("change", () => {
    trackEvent("filter_used", {
      filter_type: "track",
      filter_value: elements.trackFilter.value || "all",
      result_count: filteredRecords().length,
    });
  });
  elements.tableFilter.addEventListener("change", () => {
    trackEvent("filter_used", {
      filter_type: "tables_only",
      filter_value: String(elements.tableFilter.checked),
      result_count: filteredRecords().length,
    });
  });
  elements.clearFilters.addEventListener("click", clearFilters);
  elements.loadMore.addEventListener("click", () => {
    state.visibleLimit += LIMIT_STEP;
    renderResults();
  });
  elements.results.addEventListener("click", (event) => {
    const sourceLink = event.target.closest("[data-source-uid]");
    if (sourceLink) {
      const record = state.data.abstracts.find((item) => item.uid === sourceLink.dataset.sourceUid);
      trackEvent("view_ean_source", {
        abstract_id: sourceLink.dataset.sourceUid,
        abstract_number: record?.abstract_number || "",
        source_context: "result_card",
      });
      return;
    }
    const button = event.target.closest("[data-uid]");
    if (button) openDetail(button.dataset.uid);
  });
  elements.dialog.addEventListener("click", (event) => {
    const sourceLink = event.target.closest("[data-source-uid]");
    if (sourceLink) {
      const record = state.data.abstracts.find((item) => item.uid === sourceLink.dataset.sourceUid);
      trackEvent("view_ean_source", {
        abstract_id: sourceLink.dataset.sourceUid,
        abstract_number: record?.abstract_number || "",
        source_context: "detail_dialog",
      });
      return;
    }
    const downloadButton = event.target.closest("[data-download-uid]");
    if (downloadButton) {
      const record = state.data.abstracts.find((item) => item.uid === downloadButton.dataset.downloadUid);
      if (record) downloadRecordJson(record);
      return;
    }
    if (event.target === elements.dialog || event.target.closest(".dialog-close")) {
      elements.dialog.close();
    }
  });
  elements.trackList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-value]");
    if (!button) return;
    elements.trackFilter.value = button.dataset.filterValue;
    syncStateFromControls();
    document.querySelector("#browse").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elements.sessionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter-value]");
    if (!button) return;
    elements.sessionFilter.value = button.dataset.filterValue;
    syncStateFromControls();
    document.querySelector("#browse").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function start() {
  initElements();
  bindEvents();
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Failed to load ${DATA_URL}`);
    state.data = await response.json();
    populateSelect(elements.sessionFilter, state.data.session_types);
    populateSelect(elements.trackFilter, state.data.tracks);
    populateStats(state.data);
    renderAnalytics(elements.trackList, state.data.tracks);
    renderAnalytics(elements.sessionList, state.data.session_types, state.data.session_types.length);
    renderResults();
    applyDeepLinkFromUrl();
  } catch (error) {
    elements.resultCount.textContent = "Unable to load abstract data.";
    elements.results.innerHTML = `<li><p>${escapeHtml(error.message)}</p></li>`;
  }
}

start();
