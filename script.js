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

// --- Modal de planes ---
const modal = document.getElementById("modal-planes");

if (modal) {
  const modalBox = modal.querySelector(".modal-box");
  const foco = "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])";
  let disparador = null;

  const abrirModal = (trigger) => {
    disparador = trigger;
    // Compensa el ancho de la barra de scroll para que la landing no salte
    const barra = window.innerWidth - document.documentElement.clientWidth;
    if (barra > 0) document.body.style.paddingRight = barra + "px";
    document.body.classList.add("modal-open");
    modal.hidden = false;
    (modalBox.querySelector(".modal-close") || modalBox).focus();
  };

  const cerrarModal = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    if (disparador) disparador.focus();
    disparador = null;
  };

  document.querySelectorAll("[data-open-planes]").forEach((btn) => {
    btn.addEventListener("click", () => abrirModal(btn));
  });

  modal.querySelectorAll("[data-close-planes]").forEach((btn) => {
    btn.addEventListener("click", cerrarModal);
  });

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;

    if (e.key === "Escape") {
      cerrarModal();
      return;
    }

    // Mantiene el foco dentro del modal
    if (e.key === "Tab") {
      const focusables = [...modalBox.querySelectorAll(foco)].filter(
        (el) => el.offsetParent !== null
      );
      if (!focusables.length) return;
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }
  });

  // Elegir un plan: lo guarda, cierra y lleva al formulario
  modal.querySelectorAll("[data-plan]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.plan;
      const campoPlan = document.getElementById("f-plan");
      const servicio = document.getElementById("f-servicio");
      const aviso = document.getElementById("plan-elegido");

      if (campoPlan) campoPlan.value = plan;
      if (servicio) servicio.value = "Gestión de redes sociales";
      if (aviso) {
        aviso.querySelector("strong").textContent = plan;
        aviso.hidden = false;
      }

      cerrarModal();
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

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
