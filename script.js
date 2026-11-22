(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;
  if (!toggle) return;

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("profile-theme");
  } catch {
    // Tema tetap dapat diganti jika penyimpanan lokal tidak tersedia.
  }

  const applyTheme = (theme) => {
    const light = theme === "light";
    root.dataset.theme = light ? "light" : "dark";
    toggle.setAttribute("aria-pressed", String(light));
    toggle.setAttribute("aria-label", light ? "Aktifkan tema gelap" : "Aktifkan tema terang");
    toggle.firstElementChild.textContent = light ? "☾" : "☼";
  };

  applyTheme(savedTheme === "light" ? "light" : "dark");

  toggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    applyTheme(nextTheme);
    try {
      localStorage.setItem("profile-theme", nextTheme);
    } catch {
      // Preferensi hanya berlaku selama halaman terbuka.
    }
  });
})();
