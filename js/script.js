/* eslint-disable no-console */

(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const safeMatchMedia = (query) => {
    try {
      return typeof window.matchMedia === "function" ? window.matchMedia(query) : null;
    } catch {
      return null;
    }
  };

  const prefersReducedMotion = (() => {
    const mm = safeMatchMedia("(prefers-reduced-motion: reduce)");
    return mm ? Boolean(mm.matches) : false;
  })();

  const STORAGE_KEY = "dp_theme";
  const THEMES = { light: "light", dark: "dark" };

  const icons = {
    sun: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,
    moon: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M21 13.2A8.5 8.5 0 1 1 10.8 3a6.8 6.8 0 0 0 10.2 10.2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    github: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.77.6-3.36-1.17-3.36-1.17-.45-1.14-1.1-1.44-1.1-1.44-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.33 1.08 2.9.83.09-.65.35-1.08.63-1.33-2.21-.25-4.53-1.1-4.53-4.9 0-1.08.39-1.97 1.03-2.66-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.52 9.52 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.69 1.03 1.58 1.03 2.66 0 3.81-2.32 4.64-4.54 4.89.36.31.68.92.68 1.86v2.76c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" fill="currentColor"/>
      </svg>
    `,
    linkedin: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6.94 6.5A2.44 2.44 0 1 1 7 1.62a2.44 2.44 0 0 1-.06 4.88ZM2.7 22.2V8.1h4.5v14.1H2.7ZM9.6 22.2V8.1h4.3v1.92h.06c.6-1.14 2.06-2.34 4.24-2.34 4.54 0 5.38 2.99 5.38 6.88v7.64h-4.5v-6.78c0-1.62-.03-3.71-2.26-3.71-2.26 0-2.6 1.77-2.6 3.6v6.9H9.6Z" fill="currentColor"/>
      </svg>
    `,
    twitter: `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18.9 2.25h3.3l-7.2 8.2 8.5 11.3h-6.65l-5.2-6.8-6 6.8H2.25l7.7-8.8L1.8 2.25h6.85l4.7 6.2 5.55-6.2Zm-1.15 17.6h1.85L7.6 4.05H5.62l12.13 15.8Z" fill="currentColor"/>
      </svg>
    `,
  };

  const toast = (() => {
    const el = $("#toast");
    let t;
    function show(message, ms = 2200) {
      if (!el) return;
      window.clearTimeout(t);
      el.textContent = message;
      el.classList.add("is-visible");
      t = window.setTimeout(() => el.classList.remove("is-visible"), ms);
    }
    return { show };
  })();

  function getSystemTheme() {
    const mm = safeMatchMedia("(prefers-color-scheme: dark)");
    const prefersDark = mm ? Boolean(mm.matches) : false;
    return prefersDark ? THEMES.dark : THEMES.light;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const toggle = $("#themeToggle");
    const icon = $("#themeIcon");

    const isDark = theme === THEMES.dark;
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? "Toggle light mode" : "Toggle dark mode");
      toggle.title = isDark ? "Switch to light theme" : "Switch to dark theme";
    }
    if (icon) icon.innerHTML = isDark ? icons.sun : icons.moon;
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const theme = saved === THEMES.light || saved === THEMES.dark ? saved : getSystemTheme();
    applyTheme(theme);

    const toggle = $("#themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") || THEMES.dark;
        const next = current === THEMES.dark ? THEMES.light : THEMES.dark;
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
      });
    }
  }

  function initNav() {
    const header = $("#siteHeader");
    const toggle = $("#navToggle");
    const menu = $("#navMenu");
    const links = $$(".nav__link");

    const setOpen = (open) => {
      if (!toggle || !menu) return;
      toggle.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
    };

    if (toggle) {
      toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        setOpen(!isOpen);
      });
    }

    // Close on link click (mobile)
    links.forEach((a) => a.addEventListener("click", () => setOpen(false)));

    // Close on Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!menu || !toggle) return;
      const target = e.target;
      const clickedInside = menu.contains(target) || toggle.contains(target);
      if (!clickedInside) setOpen(false);
    });

    // Header shadow/border on scroll
    const onScroll = () => {
      const scrolled = window.scrollY > 8;
      if (header) header.classList.toggle("is-scrolled", scrolled);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initScrollProgressAndTop() {
    const bar = $("#scrollProgressBar");
    const backToTop = $("#backToTop");

    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      if (bar) bar.style.width = `${progress * 100}%`;
      if (backToTop) backToTop.classList.toggle("is-visible", scrollTop > 600);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        if (prefersReducedMotion) {
          window.scrollTo(0, 0);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    }
  }

  function initRevealOnScroll() {
    const els = $$(".reveal");
    if (!els.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => obs.observe(el));
  }

  function isValidEmail(email) {
    // Pragmatic, avoids overly strict validation.
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
  }

  function setError(id, message) {
    const el = $(`#${id}`);
    if (el) el.textContent = message || "";
  }

  function initContactForm() {
    const form = $("#contactForm");
    const submit = $("#contactSubmit");

    // Inject social icons
    $$("[data-icon]").forEach((el) => {
      const name = el.getAttribute("data-icon");
      if (name && icons[name]) el.innerHTML = icons[name];
    });

    // Placeholder links (user can update later)
    const github = $("#githubLink");
    const twitter = $("#twitterLink");
    if (github) github.href = "#";
    if (twitter) twitter.href = "#";

    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!submit) return;

      const nameEl = $("#name");
      const emailEl = $("#email");
      const messageEl = $("#message");

      const name = nameEl && nameEl.value ? String(nameEl.value).trim() : "";
      const email = emailEl && emailEl.value ? String(emailEl.value).trim() : "";
      const message = messageEl && messageEl.value ? String(messageEl.value).trim() : "";

      let ok = true;
      setError("nameError", "");
      setError("emailError", "");
      setError("messageError", "");

      if (name.length < 2) {
        ok = false;
        setError("nameError", "Please enter your name.");
      }
      if (!isValidEmail(email)) {
        ok = false;
        setError("emailError", "Please enter a valid email.");
      }
      if (message.length < 10) {
        ok = false;
        setError("messageError", "Please enter a message (at least 10 characters).");
      }

      if (!ok) {
        toast.show("Please fix the highlighted fields.");
        return;
      }

      submit.classList.add("is-loading");
      submit.setAttribute("disabled", "true");

      try {
        // Lightweight "submit" simulation for UX
        await new Promise((r) => window.setTimeout(r, 650));

        const subject = encodeURIComponent(`Portfolio message from ${name}`);
        const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
        window.location.href = `mailto:deepakpanwar1990@gmail.com?subject=${subject}&body=${body}`;
        toast.show("Opening your email client…");
        form.reset();
      } finally {
        submit.classList.remove("is-loading");
        submit.removeAttribute("disabled");
      }
    });
  }

  function initYear() {
    const el = $("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initLoader() {
    const loader = $("#pageLoader");
    if (!loader) return;

    // Ensure loader is visible until first paint.
    requestAnimationFrame(() => {
      window.setTimeout(() => loader.classList.add("is-hidden"), prefersReducedMotion ? 0 : 450);
    });
  }

  function initSmoothScrollFixes() {
    // Ensure anchor navigation lands correctly with sticky header.
    // (CSS scroll-margin is lighter, but applying to every section is verbose.)
    const header = $("#siteHeader");
    const headerH = () => (header ? header.getBoundingClientRect().height : 72);

    const onClick = (e) => {
      const targetNode = e.target;
      const a =
        targetNode && typeof targetNode.closest === "function"
          ? targetNode.closest("a[href^='#']")
          : null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerH() - 8;
      window.scrollTo({ top, behavior: prefersReducedMotion ? "auto" : "smooth" });
      history.pushState(null, "", href);
    };
    document.addEventListener("click", onClick);
  }

  function boot() {
    initTheme();
    initNav();
    initScrollProgressAndTop();
    initRevealOnScroll();
    initContactForm();
    initYear();
    initLoader();
    initSmoothScrollFixes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

