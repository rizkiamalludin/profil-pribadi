// Tahun otomatis di footer
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Animasi reveal saat scroll, dengan fallback untuk browser lama.
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

// Efek ketik nama hanya berjalan jika pengguna tidak mengurangi animasi.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const typedEl = document.getElementById("typed-name");
if (typedEl && !reducedMotion) {
  const fullText = typedEl.textContent;
  let charIndex = 0;
  typedEl.textContent = "";

  function typeLoop() {
    if (charIndex <= fullText.length) {
      typedEl.textContent = fullText.slice(0, charIndex);
      charIndex++;
      window.setTimeout(typeLoop, 90);
    } else {
      window.setTimeout(() => {
        charIndex = 0;
        typedEl.textContent = "";
        window.setTimeout(typeLoop, 400);
      }, 3500);
    }
  }
  typeLoop();
}

// Layar pembuka dan indikator progres.
(() => {
  const screen = document.getElementById("loading-screen");
  const bar = document.getElementById("loader-bar");
  const percent = document.getElementById("loader-percent");

  if (screen && bar && percent) {
    let value = 0;
    const finish = () => {
      screen.classList.add("done");
    };
    const load = () => {
      value = Math.min(100, value + (reducedMotion ? 100 : 3));
      bar.style.width = value + "%";
      percent.textContent = value + "%";

      if (value < 100) {
        window.setTimeout(load, 35);
      } else {
        window.setTimeout(finish, 250);
      }
    };
    load();
  }

  // Starfield tidak dijalankan pada perangkat yang meminta animasi dikurangi.
  const canvas = document.getElementById("starfield");
  const context = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  if (context && !reducedMotion) {
    let width = 0;
    let height = 0;
    let stars = [];

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * ratio;
      height = canvas.height = window.innerHeight * ratio;
      stars = Array.from(
        { length: Math.min(130, Math.floor(window.innerWidth / 8)) },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.3,
          alpha: Math.random(),
          velocity: Math.random() * 0.006 + 0.001
        })
      );
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      stars.forEach((star) => {
        star.alpha += star.velocity;
        if (star.alpha > 1 || star.alpha < 0.15) star.velocity *= -1;
        context.globalAlpha = star.alpha;
        context.fillStyle = "#dbeafe";
        context.beginPath();
        context.arc(
          star.x,
          star.y,
          star.radius * (window.devicePixelRatio || 1),
          0,
          Math.PI * 2
        );
        context.fill();
      });
      window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  // Tali SVG selalu dibuat, termasuk ketika prefers-reduced-motion aktif.
  // Yang dikurangi hanya efek tilt; gambar tali tetap statis dan terlihat.
  const card = document.getElementById("id-card-3d");
  if (card) {
    const nav = document.querySelector(".nav");
    const svgNS = "http://www.w3.org/2000/svg";
    const rope = document.createElementNS(svgNS, "svg");
    rope.id = "id-card-rope";
    rope.setAttribute("aria-hidden", "true");
    rope.setAttribute("focusable", "false");
    rope.innerHTML = `
      <defs>
        <linearGradient id="ropeColor" x1="0" x2="1">
          <stop offset="0" stop-color="#312e81"/>
          <stop offset=".5" stop-color="#a5b4fc"/>
          <stop offset="1" stop-color="#4338ca"/>
        </linearGradient>
      </defs>
      <path id="rope-shadow" fill="none" stroke="#050816" stroke-width="13" stroke-linecap="round" opacity=".65"/>
      <path id="rope-main" fill="none" stroke="url(#ropeColor)" stroke-width="9" stroke-linecap="round"/>
      <path id="rope-shine" fill="none" stroke="#c7d2fe" stroke-width="2" stroke-linecap="round" opacity=".75"/>
    `;
    document.body.appendChild(rope);
    card.classList.add("has-svg-rope");

    const shadow = rope.querySelector("#rope-shadow");
    const main = rope.querySelector("#rope-main");
    const shine = rope.querySelector("#rope-shine");

    let anchorX = 0;
    let anchorY = 0;
    let pressed = false;
    let startX = 0;
    let startY = 0;
    let moveX = 0;
    let moveY = 0;
    let returnFrame = 0;

    const setAnchor = () => {
      const cardRect = card.getBoundingClientRect();
      const navRect = nav ? nav.getBoundingClientRect() : null;
      // Titik gantung di bawah header, pada posisi tengah kartu saat diam.
      anchorX = cardRect.left + cardRect.width / 2;
      anchorY = navRect ? Math.max(0, navRect.bottom + 3) : 12;
    };

    const updateRope = () => {
      const rect = card.getBoundingClientRect();
      const endX = rect.left + rect.width / 2;
      const endY = rect.top + 3;
      const dx = endX - anchorX;
      const dy = endY - anchorY;
      const sag = Math.min(190, Math.max(75, Math.abs(dx) * 0.42 + Math.abs(dy) * 0.28 + 45));
      const controlX = (anchorX + endX) / 2;
      const controlY = (anchorY + endY) / 2 + sag;
      const path = `M ${anchorX} ${anchorY} Q ${controlX} ${controlY} ${endX} ${endY}`;

      [shadow, main, shine].forEach((element) => {
        if (element) element.setAttribute("d", path);
      });
    };

    const applyCardTransform = (clientX, clientY) => {
      const rect = card.getBoundingClientRect();
      const x = rect.width ? (clientX - rect.left) / rect.width - 0.5 : 0;
      const y = rect.height ? (clientY - rect.top) / rect.height - 0.5 : 0;
      const tiltX = reducedMotion ? 0 : -y * (pressed ? 8 : 10);
      const tiltY = reducedMotion ? 0 : x * (pressed ? 10 : 12);
      const scale = pressed && !reducedMotion ? 0.975 : 1;

      card.style.transform =
        `perspective(900px) translate(${moveX}px, ${moveY}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scale})`;
      updateRope();
    };

    const resetCard = () => {
      pressed = false;
      moveX = 0;
      moveY = 0;
      card.style.transform = "perspective(900px) translate(0, 0) rotateX(0deg) rotateY(0deg) scale(1)";
      card.style.transitionDuration = reducedMotion ? "0.01ms" : ".28s";

      window.cancelAnimationFrame(returnFrame);
      const started = performance.now();
      const followReturn = (now) => {
        updateRope();
        if (now - started < (reducedMotion ? 40 : 320)) {
          returnFrame = window.requestAnimationFrame(followReturn);
        }
      };
      returnFrame = window.requestAnimationFrame(followReturn);
    };

    // Render tali saat halaman pertama kali dibuka, bukan menunggu mouse bergerak.
    setAnchor();
    updateRope();
    window.requestAnimationFrame(updateRope);
    window.setTimeout(updateRope, 120);
    // Sinkronkan lagi setelah animasi reveal kartu selesai.
    window.setTimeout(() => {
      if (!pressed) setAnchor();
      updateRope();
    }, 900);

    card.addEventListener("pointerdown", (event) => {
      pressed = true;
      startX = event.clientX - moveX;
      startY = event.clientY - moveY;
      card.style.transitionDuration = reducedMotion ? "0.01ms" : ".06s";
      if (card.setPointerCapture) card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointermove", (event) => {
      if (pressed) {
        moveX = Math.max(-85, Math.min(85, event.clientX - startX));
        moveY = Math.max(-55, Math.min(55, event.clientY - startY));
      }
      applyCardTransform(event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
      card.addEventListener(eventName, resetCard);
    });

    card.addEventListener("pointerleave", () => {
      if (!pressed) resetCard();
    });

    window.addEventListener("scroll", updateRope, { passive: true });
    window.addEventListener("resize", () => {
      if (!pressed) setAnchor();
      updateRope();
    });

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(() => {
        if (!pressed) setAnchor();
        updateRope();
      });
      resizeObserver.observe(card);
      if (nav) resizeObserver.observe(nav);
    }
  }

  // Filter kategori proyek.
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      projectCards.forEach((project) => {
        project.hidden =
          button.dataset.filter !== "all" &&
          project.dataset.category !== button.dataset.filter;
      });
    });
  });
})();
