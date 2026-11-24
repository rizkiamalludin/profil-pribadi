(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const backend = window.ProfileBackend;
  const page = document.body.dataset.page || "home";
  const translations = {
    id: { unavailable: "Data belum dapat dimuat. Coba muat ulang halaman.", noPoetry: "Belum ada puisi yang diterbitkan. Karya akan ditampilkan setelah siap dibagikan.", noPosts: "Belum ada catatan yang dipublikasikan. Catatan baru akan muncul setelah ditinjau dan diterbitkan.", successContact: "Pesan berhasil disimpan ke inbox.", failed: "Terjadi kendala. Silakan coba lagi." },
    en: { unavailable: "Data is unavailable. Please reload the page.", noPoetry: "No poems have been published yet. Writing will appear here when it is ready to share.", noPosts: "No posts have been published yet. New posts appear after review and publication.", successContact: "Your message was saved to the private inbox.", failed: "Something went wrong. Please try again." }
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
      watchReveal($$(".poem-card", container));
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
    watchReveal($$(".post-card", container));
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


  let revealObserver = null;
  function watchReveal(nodes) {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!revealObserver) {
      document.documentElement.classList.add("has-reveal");
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    }
    nodes.forEach((node, index) => {
      if (node && !node.classList.contains("reveal")) {
        node.style.setProperty("--reveal-delay", Math.min(index % 5, 4) * 65 + "ms");
        node.classList.add("reveal");
        revealObserver.observe(node);
      }
    });
  }


  function setupRouteTransitions() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const overlay = $("#route-transition");
    if (!overlay) return;
    document.addEventListener("click", event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      if (/\.(pdf|zip|png|jpe?g|webp|svg|mp4|mp3)$/i.test(destination.pathname)) return;
      event.preventDefault();
      overlay.classList.add("is-active");
      document.documentElement.classList.add("is-navigating");
      window.setTimeout(() => window.location.assign(destination.href), 360);
    });
  }

  function setupPointerMotion() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduced || !finePointer) return;

    const hero = $(".hero");
    const photo = $(".profile-photo");
    if (hero) {
      hero.addEventListener("pointermove", event => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--hero-x", (event.clientX - rect.left) + "px");
        hero.style.setProperty("--hero-y", (event.clientY - rect.top) + "px");
      }, { passive: true });
      hero.addEventListener("pointerleave", () => {
        hero.style.setProperty("--hero-x", "50%");
        hero.style.setProperty("--hero-y", "35%");
      });
    }

    const photoFrame = $(".profile-frame");
    if (photoFrame && photo) {
      photoFrame.addEventListener("pointermove", event => {
        const rect = photoFrame.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        photo.style.setProperty("--photo-rx", (-y * 4).toFixed(2) + "deg");
        photo.style.setProperty("--photo-ry", (x * 5).toFixed(2) + "deg");
      }, { passive: true });
      photoFrame.addEventListener("pointerleave", () => {
        photo.style.setProperty("--photo-rx", "0deg");
        photo.style.setProperty("--photo-ry", "0deg");
      });
    }

    $$(".button").forEach(button => {
      button.addEventListener("pointermove", event => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (event.clientY - rect.top - rect.height / 2) / rect.height;
        button.style.setProperty("--mag-x", (x * 5).toFixed(1) + "px");
        button.style.setProperty("--mag-y", (y * 4).toFixed(1) + "px");
      }, { passive: true });
      button.addEventListener("pointerleave", () => {
        button.style.setProperty("--mag-x", "0px");
        button.style.setProperty("--mag-y", "0px");
      });
    });

    $$(".interest-card,.poem-card,.garden-note,.post-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.setProperty("--tilt-x", (-y * 2.2).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", (x * 2.2).toFixed(2) + "deg");
      }, { passive: true });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  function setupActiveNavigation() {
    if (!("IntersectionObserver" in window)) return;
    const navLinks = $$(".main-nav a[href^='#']");
    if (!navLinks.length) return;
    const sections = navLinks.map(link => $(link.getAttribute("href"))).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-current", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-32% 0px -58% 0px", threshold: 0 });
    sections.forEach(section => observer.observe(section));
  }

  function setupUiEffects() {
    const loader = $("#page-loader");
    if (loader) {
      const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 760;
      window.setTimeout(() => {
        loader.classList.add("is-hidden");
        window.setTimeout(() => loader.remove(), 520);
      }, delay);
      window.addEventListener("pageshow", event => {
        if (event.persisted) loader.remove();
      }, { once: true });
    }

    const progress = $("#scroll-progress");
    const backToTop = $("#back-to-top");
    let scheduled = false;
    const updateScrollUi = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        const available = document.documentElement.scrollHeight - window.innerHeight;
        const amount = available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0;
        if (progress) progress.style.setProperty("--scroll-progress", String(amount));
        if (backToTop) backToTop.classList.toggle("is-visible", window.scrollY > 480);
        scheduled = false;
      });
    };
    window.addEventListener("scroll", updateScrollUi, { passive: true });
    window.addEventListener("resize", updateScrollUi, { passive: true });
    updateScrollUi();

    backToTop?.addEventListener("click", () => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    watchReveal($$(".section-heading,.surface-card,.post-card,.timeline-item,.poem-card,.garden-note,.principle-card,.achievement-card"));
    setupRouteTransitions();
    setupPointerMotion();
    setupActiveNavigation();
  }

  function init() {
    const year = $("#year"); if (year) year.textContent = String(new Date().getFullYear());
    applyTheme(getStored("profile-theme", "dark"));
    applyLanguage(getStored("profile-language", "id"));
    $("#theme-toggle")?.addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light"));
    $("#language-toggle")?.addEventListener("click", () => applyLanguage(language === "id" ? "en" : "id"));
    if (page === "home") {
      bindPublicForm("contact-form", "contact", "contact-status", ["name","email","subject","message"], "successContact");
    }
    setupUiEffects();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();