/* nav state + scroll reveal + single source of truth for the app URL */
(function () {
  // ── The live dashboard. ONE place to change.
  const APP_URL = "https://app.kraftatlas.no";
  document.querySelectorAll("[data-app]").forEach((a) => {
    a.setAttribute("href", APP_URL);
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });

  // respect reduced-motion: hold the flow clip on its poster frame
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video.flow-video").forEach((v) => {
      v.removeAttribute("autoplay");
      v.addEventListener("loadeddata", () => v.pause());
      try { v.pause(); } catch (e) {}
    });
  }

  // ── Header scroll shadow ───────────────────────────────────────
  const header = document.querySelector("header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ── Scroll reveal ──────────────────────────────────────────────
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ── Year ───────────────────────────────────────────────────────
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // ── Active nav link — current page ────────────────────────────
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav-links a.link").forEach((a) => {
    const href = (a.getAttribute("href") || "").replace(/\/$/, "") || "/";
    // exact page match (ignores anchor links like #problem)
    if (!href.startsWith("#") && !href.startsWith("/#") && href === path) {
      a.classList.add("active");
    }
  });

  // ── Active nav link — scroll-based (home page anchor links) ───
  const anchorLinks = [...document.querySelectorAll(".nav-links a.link[href^='#'], .nav-links a.link[href^='/#']")];
  if (anchorLinks.length) {
    const sectionMap = new Map();
    anchorLinks.forEach((a) => {
      const id = a.getAttribute("href").replace(/^\/?#/, "");
      const sec = document.getElementById(id);
      if (sec) sectionMap.set(sec, a);
    });
    if (sectionMap.size) {
      const secIO = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          const link = sectionMap.get(e.target);
          if (link) link.classList.toggle("active", e.isIntersecting);
        }),
        { rootMargin: "-15% 0px -55% 0px" }
      );
      sectionMap.forEach((_, sec) => secIO.observe(sec));
    }
  }

  // ── Active sub-nav (product page section tabs) ─────────────────
  const subLinks = [...document.querySelectorAll(".subnav a")];
  if (subLinks.length) {
    const subMap = new Map();
    subLinks.forEach((a) => {
      const id = a.getAttribute("href").replace("#", "");
      const sec = document.getElementById(id);
      if (sec) subMap.set(sec, a);
    });
    if (subMap.size) {
      // default: first sub-link active on load
      subLinks[0].classList.add("active");
      const subIO = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          const link = subMap.get(e.target);
          if (!link) return;
          if (e.isIntersecting) {
            subLinks.forEach((l) => l.classList.remove("active"));
            link.classList.add("active");
          }
        }),
        { rootMargin: "-15% 0px -55% 0px" }
      );
      subMap.forEach((_, sec) => subIO.observe(sec));
    }
  }

  // ── Mobile hamburger ───────────────────────────────────────────
  const hamburger = document.querySelector(".nav-hamburger");
  const navLinks  = document.querySelector(".nav-links");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = navLinks.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
    // close on nav link click (mobile)
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }
})();
