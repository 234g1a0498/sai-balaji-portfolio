"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initLoadingAnimation();
  initThemeToggle();
  initScrollProgress();
  initCustomCursor(prefersReducedMotion);
  initParticleBackground(prefersReducedMotion);
  initMobileMenu();
  initTypingEffect(prefersReducedMotion);
  initRevealAnimations(prefersReducedMotion);
  initAnimatedCounters(prefersReducedMotion);
  initActiveNavigation();
  initCardTilt(prefersReducedMotion);
  initProjectFiltering();
  initContributionGrid();
  initContactForm();
  initHeaderDepth();
});

function initLoadingAnimation() {
  const loader = document.querySelector("[data-loader]");
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add("is-hidden");
    window.setTimeout(() => loader.remove(), 650);
  };

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 420);
  } else {
    window.addEventListener("load", () => window.setTimeout(hideLoader, 420), { once: true });
  }
}

function initThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  const storedTheme = localStorage.getItem("portfolio-theme");
  const systemPrefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const initialTheme = storedTheme || (systemPrefersLight ? "light" : "dark");

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);
    const isLight = theme === "light";
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  };

  setTheme(initialTheme);

  toggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

function initScrollProgress() {
  const progress = document.querySelector("[data-scroll-progress]");
  if (!progress) return;

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progressValue = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${Math.min(progressValue, 100)}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function initCustomCursor(prefersReducedMotion) {
  if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

  const cursor = document.querySelector("[data-cursor]");
  const dot = document.querySelector("[data-cursor-dot]");
  if (!cursor || !dot) return;

  let cursorX = 0;
  let cursorY = 0;
  let dotX = 0;
  let dotY = 0;

  const render = () => {
    cursorX += (dotX - cursorX) * 0.18;
    cursorY += (dotY - cursorY) * 0.18;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };

  window.addEventListener("pointermove", (event) => {
    dotX = event.clientX;
    dotY = event.clientY;
    cursor.classList.add("is-visible");
    dot.classList.add("is-visible");
  });

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest("a, button, input, textarea, .glass-card, .skill-chip")) {
      cursor.classList.add("is-active");
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.target.closest("a, button, input, textarea, .glass-card, .skill-chip")) {
      cursor.classList.remove("is-active");
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
    dot.classList.remove("is-visible");
  });

  render();
}

function initParticleBackground(prefersReducedMotion) {
  const canvas = document.querySelector("[data-particles]");
  if (!canvas || prefersReducedMotion) return;

  const context = canvas.getContext("2d");
  const particles = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  const getParticleCount = () => {
    if (window.innerWidth < 560) return 32;
    if (window.innerWidth < 1024) return 52;
    return 76;
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createParticles();
  };

  const createParticles = () => {
    particles.length = 0;
    const count = getParticleCount();

    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        alpha: Math.random() * 0.45 + 0.18,
      });
    }
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(103, 232, 249, ${particle.alpha})`;
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const nextParticle = particles[nextIndex];
        const distance = Math.hypot(particle.x - nextParticle.x, particle.y - nextParticle.y);

        if (distance < 118) {
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(nextParticle.x, nextParticle.y);
          context.strokeStyle = `rgba(167, 139, 250, ${0.11 * (1 - distance / 118)})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }
    });

    animationFrame = requestAnimationFrame(draw);
  };

  resize();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resize();
    draw();
  });
}

function initMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");

  if (!toggle || !menu) return;

  const links = menu.querySelectorAll("a");

  const closeMenu = () => {
    toggle.classList.remove("is-open");
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
  };

  const openMenu = () => {
    toggle.classList.add("is-open");
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    const clickedInside = menu.contains(event.target) || toggle.contains(event.target);
    if (!clickedInside) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });
}

function initTypingEffect(prefersReducedMotion) {
  const target = document.querySelector(".typing-text");
  if (!target) return;

  const words = parseTypingWords(target);
  if (!words.length) return;

  if (prefersReducedMotion) {
    target.textContent = words[0];
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const type = () => {
    const currentWord = words[wordIndex];
    const visibleText = currentWord.slice(0, charIndex);
    target.textContent = visibleText;

    if (!isDeleting && charIndex < currentWord.length) {
      charIndex += 1;
      window.setTimeout(type, 72);
      return;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      window.setTimeout(type, 1450);
      return;
    }

    if (isDeleting && charIndex > 0) {
      charIndex -= 1;
      window.setTimeout(type, 38);
      return;
    }

    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    window.setTimeout(type, 280);
  };

  type();
}

function parseTypingWords(target) {
  const rawValue = target.getAttribute("data-typing");

  if (!rawValue) {
    return [target.textContent.trim()].filter(Boolean);
  }

  try {
    const parsed = JSON.parse(rawValue);
    return parsed.map((item) => String(item).trim()).filter(Boolean);
  } catch {
    return rawValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function initRevealAnimations(prefersReducedMotion) {
  const animatedElements = [...document.querySelectorAll("[data-animate]")];
  if (!animatedElements.length) return;

  animatedElements.forEach((element, index) => {
    element.style.setProperty("--delay", `${Math.min(index * 45, 360)}ms`);
  });

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    animatedElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  animatedElements.forEach((element) => observer.observe(element));
}

function initAnimatedCounters(prefersReducedMotion) {
  const counters = [...document.querySelectorAll("[data-counter]")];
  if (!counters.length) return;

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || "0");
    const decimals = Number(counter.dataset.decimals || "0");
    const duration = prefersReducedMotion ? 1 : 1350;
    const startTime = performance.now();

    const render = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      counter.textContent = value.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(render);
      } else {
        counter.textContent = target.toFixed(decimals);
      }
    };

    requestAnimationFrame(render);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initActiveNavigation() {
  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...document.querySelectorAll(".nav-links a")];

  if (!sections.length || !links.length || !("IntersectionObserver" in window)) return;

  const linkMap = new Map(
    links.map((link) => [link.getAttribute("href")?.replace("#", ""), link]),
  );

  const setActiveLink = (sectionId) => {
    links.forEach((link) => link.removeAttribute("aria-current"));
    const activeLink = linkMap.get(sectionId);
    if (activeLink) activeLink.setAttribute("aria-current", "page");
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visibleEntries[0]) {
        setActiveLink(visibleEntries[0].target.id);
      }
    },
    {
      threshold: [0.18, 0.32, 0.48, 0.64],
      rootMargin: "-24% 0px -54% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

function initCardTilt(prefersReducedMotion) {
  if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

  const cards = document.querySelectorAll(
    ".project-card, .achievement-card, .certification-card, .profile-link-card, .hero-card",
  );

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -7;
      const rotateY = ((x / rect.width) - 0.5) * 7;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      card.style.setProperty("--cursor-x", `${x}px`);
      card.style.setProperty("--cursor-y", `${y}px`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function initProjectFiltering() {
  const filterGroup = document.querySelector("[data-project-filters]");
  const projectCards = [...document.querySelectorAll("[data-project-card]")];

  if (!filterGroup || !projectCards.length) return;

  const buttons = [...filterGroup.querySelectorAll("[data-filter]")];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";

      buttons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      projectCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        const shouldShow = filter === "all" || categories.includes(filter);
        card.classList.toggle("is-hidden", !shouldShow);
      });
    });
  });
}

function initContributionGrid() {
  const cells = document.querySelectorAll("[data-contribution-grid] span");

  cells.forEach((cell, index) => {
    cell.style.setProperty("--cell-index", index);
    cell.setAttribute("title", `${Number(cell.dataset.level || 0)} contribution level`);
  });
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");

  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      status.textContent = "Please complete all fields before sending.";
      status.style.color = "#fbbf24";
      return;
    }

    if (!isValidEmail(email)) {
      status.textContent = "Please enter a valid email address.";
      status.style.color = "#fbbf24";
      return;
    }

    status.textContent = "Message prepared. Sai can connect this form to email or a backend next.";
    status.style.color = "#86efac";
    form.reset();
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function initHeaderDepth() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("has-depth", window.scrollY > 12);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}
