// Nav móvil
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

// FAQ acordeón (un solo ítem abierto a la vez)
document.querySelectorAll(".faq-item").forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  question.addEventListener("click", () => {
    const isOpen = question.getAttribute("aria-expanded") === "true";

    document.querySelectorAll(".faq-question").forEach((q) => {
      q.setAttribute("aria-expanded", "false");
      q.closest(".faq-item").querySelector(".faq-answer").style.maxHeight = null;
    });

    if (!isOpen) {
      question.setAttribute("aria-expanded", "true");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// Formulario de contacto: sin backend todavía, solo confirma la recepción en pantalla
const contactForm = document.getElementById("contact-form");

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }
  contactForm.classList.add("is-sent");
});
