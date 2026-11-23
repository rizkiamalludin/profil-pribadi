(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const backend = window.ProfileBackend;
  const page = document.body.dataset.page || "home";
  const translations = {
    id: { loading: "Memuat…", unavailable: "Data belum dapat dimuat. Coba muat ulang halaman.", noProjects: "Belum ada proyek yang dipublikasikan.", noPoetry: "Belum ada puisi yang diterbitkan. Karya akan ditampilkan setelah siap dibagikan.", noPosts: "Belum ada catatan yang dipublikasikan. Catatan baru akan muncul setelah ditinjau dan diterbitkan.", noActivity: "Aktivitas GitHub belum dapat dimuat.", emptyGuestbook: "Belum ada pesan. Jadilah yang pertama menyapa.", emptyComments: "Belum ada komentar.", successContact: "Pesan berhasil disimpan ke inbox.", successGuestbook: "Pesan berhasil dikirim.", successComment: "Komentar berhasil dikirim.", failed: "Terjadi kendala. Silakan coba lagi." },
    en: { loading: "Loading…", unavailable: "Data is unavailable. Please reload the page.", noProjects: "No projects have been published yet.", noPoetry: "No poems have been published yet. Writing will appear here when it is ready to share.", noPosts: "No posts have been published yet. New posts appear after review and publication.", noActivity: "GitHub activity is currently unavailable.", emptyGuestbook: "No messages yet. Be the first to say hello.", emptyComments: "No comments yet.", successContact: "Your message was saved to the private inbox.", successGuestbook: "Your message was sent.", successComment: "Your comment was sent.", failed: "Something went wrong. Please try again." }
  };
  let language = "id";

  function getStored(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
  }
  function setStored(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Storage may be unavailable. */ }
  }
  function t(key) { return translations[language][key] || key; }
  function applyLanguage(next) {
    language = next === "en" ? "en" : "id";
    document.documentElement.lang = language;
    $$("[data-id][data-en]").forEach(node => {
      node.textContent = language === "en" ? node.dataset.en : node.dataset.id;
    });
    const button = $("#language-toggle");
    if (button) { button.textContent = language === "id" ? "EN" : "ID"; button.setAttribute("aria-label", language === "id" ? "Switch language to English" : "Ubah bahasa ke Indonesia"); }
    setStored("profile-language", language);
    if (page === "home") {
      loadPoetry(); loadLatestPosts();
    } else if (page === "journal") loadJournal();
    else if (page === "article") loadArticle();
  }

  function applyTheme(next) {
    const theme = next === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    const button = $("#theme-toggle");
    if (button) {
      button.textContent = theme === "light" ? "☾" : "☼";
      button.setAttribute("aria-pressed", String(theme === "light"));
      button.setAttribute("aria-label", theme === "light" ? "Aktifkan tema gelap" : "Aktifkan tema terang");
    }
    setStored("profile-theme", theme);
  }

  function createText(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text || "";
    return node;
  }
  function safeExternalUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" ? url.href : "";
    } catch { return ""; }
  }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(language === "en" ? "en-US" : "id-ID", { year: "numeric", month: "short", day: "numeric" });
  }
  function setStatus(id, message, isError = false) {
    const node = $("#" + id);
    if (!node) return;
    node.textContent = message;
    node.dataset.state = isError ? "error" : "success";
  }

  async function loadPoetry() {
    const container = $("#poetry-grid");
    if (!container || !backend) return;
    try {
      const rows = await backend.readTable("profile_content?select=slug,title_id,title_en,body_id,body_en,created_at,updated_at,data&content_type=eq.poetry&status=eq.published&order=sort_order.asc,updated_at.desc");
      container.replaceChildren();
      if (!rows.length) { container.append(createText("p", "empty-state", language === "en" ? "No poems have been published yet. Writing will appear here when it is ready to share." : t("noPoetry"))); return; }
      rows.forEach(row => {
        const card = createText("article", "poem-card", "");
        const label = createText("p", "eyebrow", language === "en" ? "POETRY" : "PUISI");
        const title = createText("h3", "", language === "en" ? (row.title_en || row.title_id) : row.title_id);
        const body = createText("p", "poem-body", language === "en" ? (row.body_en || row.body_id) : row.body_id);
        const date = createText("time", "muted", formatDate(row.updated_at || row.created_at));
        card.append(label, title, body, date);
        container.append(card);
      });
    } catch (error) {
      console.warn(error);
      container.replaceChildren(createText("p", "empty-state", t("unavailable")));
    }
  }

  async function loadPostsInto(container, limit) {
    if (!container || !backend) return;
    const query = "profile_content?select=slug,title_id,title_en,body_id,body_en,created_at,updated_at,data&content_type=eq.blog&status=eq.published&order=updated_at.desc&limit=" + String(limit);
    const rows = await backend.readTable(query);
    container.replaceChildren();
    if (!rows.length) { container.append(createText("p", "empty-state", t("noPosts"))); return; }
    rows.forEach(row => {
      const card = createText("article", "post-card", "");
      const title = language === "en" ? row.title_en : row.title_id;
      const body = language === "en" ? row.body_en : row.body_id;
      card.append(createText("h3", "", title));
      card.append(createText("p", "", (body || "").slice(0, 230)));
      card.append(createText("time", "", formatDate(row.updated_at || row.created_at)));
      const link = document.createElement("a");
      link.href = "article.html?slug=" + encodeURIComponent(row.slug);
      link.textContent = language === "en" ? "Read article →" : "Baca catatan →";
      card.append(link); container.append(card);
    });
  }
  async function loadLatestPosts() {
    const container = $("#latest-posts");
    if (!container || !backend) return;
    try { await loadPostsInto(container, 3); }
    catch (error) { console.warn(error); container.replaceChildren(createText("p", "empty-state", t("unavailable"))); }
  }
  async function loadJournal() {
    const container = $("#journal-grid");
    if (!container || !backend) return;
    try { await loadPostsInto(container, 50); }
    catch (error) { console.warn(error); container.replaceChildren(createText("p", "empty-state", t("unavailable"))); }
  }
  async function loadArticle() {
    const target = $("#article-detail");
    if (!target || !backend) return;
    const slug = new URLSearchParams(location.search).get("slug");
    if (!slug) { target.textContent = language === "en" ? "Article not found." : "Catatan tidak ditemukan."; return; }
    try {
      const rows = await backend.readTable("profile_content?select=slug,title_id,title_en,body_id,body_en,created_at,updated_at&content_type=eq.blog&status=eq.published&slug=eq." + encodeURIComponent(slug) + "&limit=1");
      if (!rows.length) { target.textContent = language === "en" ? "Article not found or not published." : "Catatan tidak ditemukan atau belum dipublikasikan."; return; }
      const row = rows[0];
      target.replaceChildren();
      target.append(createText("p", "eyebrow", language === "en" ? "JOURNAL" : "JURNAL"));
      target.append(createText("h1", "", language === "en" ? row.title_en : row.title_id));
      target.append(createText("time", "muted", formatDate(row.updated_at || row.created_at)));
      target.append(createText("div", "detail-body", language === "en" ? row.body_en : row.body_id));
      const back = document.createElement("a"); back.className = "text-link"; back.href = "journal.html";
      back.textContent = language === "en" ? "← Back to journal" : "← Kembali ke jurnal"; target.append(back);
    } catch (error) { console.warn(error); target.textContent = t("unavailable"); }
  }

  function bindPublicForm(formId, type, statusId, fields, successKey) {
    const form = $("#" + formId); if (!form || !backend) return;
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const button = $('button[type="submit"]', form);
      if (button) button.disabled = true;
      setStatus(statusId, language === "en" ? "Sending…" : "Mengirim…");
      const values = new FormData(form);
      const payload = { type, website: String(values.get("website") || "") };
      fields.forEach(field => payload[field] = String(values.get(field) || "").trim());
      try {
        await backend.sendPublic(payload);
        form.reset(); setStatus(statusId, t(successKey));
      } catch (error) { setStatus(statusId, error.message || t("failed"), true); }
      finally { if (button) button.disabled = false; }
    });
  }

  function init() {
    const year = $("#year"); if (year) year.textContent = String(new Date().getFullYear());
    applyTheme(getStored("profile-theme", "dark"));
    applyLanguage(getStored("profile-language", "id"));
    $("#theme-toggle")?.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"));
    $("#language-toggle")?.addEventListener("click", () => applyLanguage(language === "id" ? "en" : "id"));
    if (page === "home") {
      loadPoetry(); loadLatestPosts();
      bindPublicForm("contact-form", "contact", "contact-status", ["name","email","subject","message"], "successContact");
    }
    if (page === "journal") loadJournal();
    if (page === "article") loadArticle();
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
      }), { threshold: 0.08 });
      $(".surface-card,.post-card,.timeline-item,.poem-card,.garden-note").forEach(node => observer.observe(node));
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();