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

// --- Navegación activa según la sección visible ---
// Se elige la última sección cuyo comienzo ya pasó la línea de detección.
// Al depender de una única línea no oscila entre dos opciones en los límites.
const navWrap = document.getElementById("nav-wrap");
const enlacesNav = [...document.querySelectorAll("#nav-links a[href^='#'], .nav-cta")];

const seccionesNav = [
  ...new Set(enlacesNav.map((a) => a.getAttribute("href"))),
]
  .map((id) => ({ id, el: document.querySelector(id) }))
  .filter((s) => s.el)
  .sort((a, b) => a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top);

if (navWrap && seccionesNav.length) {
  let activa = null;
  let pendiente = false;

  const marcar = (id) => {
    if (id === activa) return;
    activa = id;
    enlacesNav.forEach((a) => {
      const suya = a.getAttribute("href") === id;
      a.classList.toggle("is-active", suya);
      if (suya) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  };

  const revisar = () => {
    pendiente = false;
    const alturaNav = navWrap.getBoundingClientRect().bottom;
    const linea = window.scrollY + alturaNav + 40;

    let elegida = seccionesNav[0];
    for (const s of seccionesNav) {
      if (s.el.getBoundingClientRect().top + window.scrollY <= linea) elegida = s;
    }
    // Al final de la página siempre gana la última sección
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      elegida = seccionesNav[seccionesNav.length - 1];
    }

    navWrap.classList.toggle("is-scrolled", window.scrollY > 8);
    marcar(elegida.id);
  };

  const pedirRevision = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(revisar);
  };

  revisar();
  window.addEventListener("scroll", pedirRevision, { passive: true });
  window.addEventListener("resize", pedirRevision);
  // El scroll suave sigue emitiendo eventos, así que el estado se corrige solo al llegar
  enlacesNav.forEach((a) => a.addEventListener("click", () => setTimeout(pedirRevision, 60)));
}

// --- Ilustración del hero ---
// Mide lo mismo que el bloque que va del título al último renglón del párrafo.
const heroIlu = document.querySelector(".hero-ilu");
const heroTitulo = document.querySelector(".hero-title");
const heroLead = document.querySelector(".hero-lead");

// Un 10% más alta que ese bloque
const ESCALA_ILU = 1.1;

if (heroIlu && heroTitulo && heroLead) {
  const ajustarIlu = () => {
    const alto =
      heroLead.getBoundingClientRect().bottom -
      heroTitulo.getBoundingClientRect().top;
    heroIlu.style.setProperty("--alto-ilu", Math.round(alto * ESCALA_ILU) + "px");
  };

  ajustarIlu();
  // Las tipografías web cambian el alto del texto al terminar de cargar
  document.fonts?.ready.then(ajustarIlu);

  if ("ResizeObserver" in window) {
    new ResizeObserver(ajustarIlu).observe(document.querySelector(".hero-copy"));
  } else {
    window.addEventListener("resize", ajustarIlu);
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

// --- Modales de servicios (planes, diseño web y automatización) ---
const SELECTOR_FOCO =
  "a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex='-1'])";

// Devuelve el foco al botón que abrió el modal y libera el scroll de la landing
function prepararModal(modal) {
  const caja = modal.querySelector(".modal-box");
  let disparador = null;

  const abrir = (trigger) => {
    disparador = trigger;
    // Compensa el ancho de la barra de scroll para que la landing no salte
    const barra = window.innerWidth - document.documentElement.clientWidth;
    if (barra > 0) document.body.style.paddingRight = barra + "px";
    document.body.classList.add("modal-open");
    modal.hidden = false;
    (caja.querySelector(".modal-close") || caja).focus();
  };

  const cerrar = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    if (disparador) disparador.focus();
    disparador = null;
  };

  document
    .querySelectorAll(`[data-open="${modal.id}"]`)
    .forEach((btn) => btn.addEventListener("click", () => abrir(btn)));

  modal
    .querySelectorAll("[data-close]")
    .forEach((btn) => btn.addEventListener("click", cerrar));

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;

    if (e.key === "Escape") {
      cerrar();
      return;
    }

    // Mantiene el foco dentro del modal
    if (e.key === "Tab") {
      const focusables = [...caja.querySelectorAll(SELECTOR_FOCO)].filter(
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

  return { abrir, cerrar };
}

const modales = new Map();
document.querySelectorAll(".modal").forEach((m) => {
  modales.set(m.id, prepararModal(m));
});

// Botones que eligen un servicio: guardan la opción, cierran y van al formulario.
// Nunca limpian lo que la persona ya escribió.
document.querySelectorAll(".modal [data-servicio]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const { servicio, detalle, campo, etiqueta } = btn.dataset;

    const selectServicio = document.getElementById("f-servicio");
    if (selectServicio && servicio) selectServicio.value = servicio;

    if (campo && detalle) {
      const oculto = document.getElementById(campo);
      if (oculto) oculto.value = detalle;

      // Un solo aviso visible: el último servicio elegido
      const aviso = document.getElementById("seleccion");
      if (aviso) {
        aviso.querySelector("span").textContent = `${etiqueta || "Seleccionaste"}:`;
        aviso.querySelector("strong").textContent = detalle;
        aviso.hidden = false;
      }
    }

    modales.get(btn.closest(".modal").id)?.cerrar();
    document
      .getElementById("contacto")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
