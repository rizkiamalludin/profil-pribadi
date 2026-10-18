// Tahun otomatis di footer
document.getElementById("year").textContent = new Date().getFullYear();

// Animasi reveal saat scroll
const revealEls = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => observer.observe(el));

// Efek ketik ringan untuk nama di hero
const typedEl = document.getElementById("typed-name");
const fullText = typedEl.textContent;
let charIndex = 0;
typedEl.textContent = "";

function typeLoop() {
  if (charIndex <= fullText.length) {
    typedEl.textContent = fullText.slice(0, charIndex);
    charIndex++;
    setTimeout(typeLoop, 90);
  } else {
    setTimeout(() => {
      charIndex = 0;
      typedEl.textContent = "";
      setTimeout(typeLoop, 400);
    }, 3500);
  }
}
typeLoop();