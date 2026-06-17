/* nav state + scroll reveal + single source of truth for the app URL */
(function () {
  // ── The live dashboard. ONE place to change.
  // Today it points at Cloud Run so links work the moment kraftatlas.no resolves.
  // Once the custom-domain mapping is live, set APP_URL = "https://app.kraftatlas.no".
  const APP_URL = "https://nordic-dashboard-690238279083.europe-west1.run.app";
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

  const header = document.querySelector("header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
