// --- Nav móvil ---
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

// --- Mockup de la notebook ---
// La escena se dibuja en las coordenadas del PNG (1080px de ancho) y se escala
// al ancho real del contenedor, para que la pantalla proyectada calce siempre.
const laptop = document.querySelector(".laptop");
const laptopStage = document.querySelector(".laptop-stage");

if (laptop && laptopStage) {
  const fitLaptop = () => {
    laptopStage.style.setProperty("--k", laptop.clientWidth / 1080);
  };
  fitLaptop();
  if ("ResizeObserver" in window) {
    new ResizeObserver(fitLaptop).observe(laptop);
  } else {
    window.addEventListener("resize", fitLaptop);
  }
}

// --- Reveal al scrollear ---
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Escalona los elementos que entran juntos
        entry.target.style.transitionDelay = `${Math.min(i * 90, 270)}ms`;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
  );
  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add("is-in"));
}

// --- FAQ acordeón (uno abierto a la vez) ---
document.querySelectorAll(".faq-item").forEach((item) => {
  const question = item.querySelector(".faq-q");
  const answer = item.querySelector(".faq-a");

  question.addEventListener("click", () => {
    const isOpen = question.getAttribute("aria-expanded") === "true";

    document.querySelectorAll(".faq-q").forEach((q) => {
      q.setAttribute("aria-expanded", "false");
      q.closest(".faq-item").querySelector(".faq-a").style.maxHeight = null;
    });

    if (!isOpen) {
      question.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// --- Formulario: sin backend todavía, confirma en pantalla ---
const contactForm = document.getElementById("contact-form");

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }
  contactForm.classList.add("is-sent");
});
