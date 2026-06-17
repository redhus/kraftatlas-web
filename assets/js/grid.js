/* Animated Nordic grid — live-flow hero.
   Topology is the real thing: zone centroids + the 27 interconnectors from the
   dashboard (mapboard/theme.py). Flow particles travel along each border with a
   direction + intensity that drifts over time, echoing the live flow layer. */

(function () {
  const canvas = document.getElementById("grid-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // lat/lon anchors (subset incl. neighbours that carry interconnectors)
  const NODES = {
    NO1:[60.5,11.0], NO2:[58.6,7.5], NO3:[63.3,9.8], NO4:[68.7,17.5], NO5:[60.8,6.2],
    SE1:[66.8,21.0], SE2:[63.5,16.5], SE3:[59.8,15.5], SE4:[56.5,14.5],
    DK1:[56.1,9.2], DK2:[55.5,11.9], FI:[62.9,26.0],
    DE:[53.6,10.5], NL:[52.3,5.5], GB:[55.0,-1.5], PL:[54.0,17.0], EE:[58.8,25.5],
  };
  const NORDIC = new Set(["NO1","NO2","NO3","NO4","NO5","SE1","SE2","SE3","SE4","DK1","DK2","FI"]);
  const BORDERS = [
    "SE1-SE2","SE2-SE3","SE3-SE4","SE1-FI","SE1-NO4","SE2-NO3","SE2-NO4","SE3-NO1",
    "SE4-DK2","NO1-NO2","NO1-NO3","NO1-NO5","NO2-NO5","NO3-NO4","NO3-NO5","NO2-DK1",
    "DK1-DK2","FI-EE","SE4-PL","SE4-DE","DK1-DE","DK2-DE","DK1-NL","NO2-DE","NO2-NL",
    "NO2-GB","DK1-GB",
  ];

  // projection bounds
  const LAT = [53.5, 70.5], LON = [-3.5, 28];
  let W, H, DPR, pad;

  function project(lat, lon) {
    const x = (lon - LON[0]) / (LON[1] - LON[0]);
    const y = (LAT[1] - lat) / (LAT[1] - LAT[0]);
    return [pad + x * (W - 2 * pad), pad + y * (H - 2 * pad)];
  }

  const COL = { accent:"#58a6ff", dim:"#8b949e", node:"#58a6ff", neighbor:"#3d4654", green:"#2ea043", red:"#f85149" };

  let edges = [], nodes = {};

  function layout() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    pad = Math.max(34, W * 0.10);

    nodes = {};
    for (const k in NODES) { const [la, lo] = NODES[k]; nodes[k] = { x: project(la, lo)[0], y: project(la, lo)[1], nordic: NORDIC.has(k) }; }

    edges = BORDERS.map((b, i) => {
      const [a, c] = b.split("-");
      const seed = (i * 47 + 13) % 100 / 100;
      return {
        a, c,
        // direction (+1 a→c) and magnitude drift independently per edge
        phase: seed * Math.PI * 2,
        speed: 0.18 + seed * 0.5,           // flow particle speed
        wobble: 0.4 + seed * 0.9,           // how fast intensity breathes
        nParticles: nodes[a].nordic && nodes[c].nordic ? 3 : 2,
      };
    });
  }

  function lerp(p, q, t) { return [p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t]; }

  let t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // ── edges (faint base lines)
    ctx.lineWidth = 1;
    for (const e of edges) {
      const A = nodes[e.a], B = nodes[e.c];
      const both = A.nordic && B.nordic;
      ctx.strokeStyle = both ? "rgba(88,166,255,0.16)" : "rgba(139,148,158,0.12)";
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }

    // ── flow particles
    for (const e of edges) {
      const A = nodes[e.a], B = nodes[e.c];
      // intensity in [-1,1] breathing over time -> sets direction + brightness
      const flow = Math.sin(t * e.wobble + e.phase);
      const dir = flow >= 0 ? 1 : -1;
      const mag = Math.abs(flow);                 // 0..1 congestion proxy
      const col = mag > 0.78 ? COL.red : (mag > 0.45 ? COL.accent : COL.green);
      const len = Math.hypot(B.x - A.x, B.y - A.y);

      for (let p = 0; p < e.nParticles; p++) {
        let tt = ((t * e.speed * (0.6 + mag) + p / e.nParticles + e.phase) % 1 + 1) % 1;
        if (dir < 0) tt = 1 - tt;
        const [x, y] = lerp(A, B, tt);
        // fade in/out at the ends
        const edgeFade = Math.min(tt, 1 - tt) * 6;
        const alpha = Math.min(1, edgeFade) * (0.35 + mag * 0.55);
        const r = 1.4 + mag * 1.6;
        ctx.beginPath();
        ctx.fillStyle = col;
        ctx.globalAlpha = alpha;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // little trailing glow
        ctx.globalAlpha = alpha * 0.25;
        ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // ── nodes
    for (const k in nodes) {
      const n = nodes[k];
      const pulse = 1 + 0.18 * Math.sin(t * 1.6 + n.x);
      if (n.nordic) {
        ctx.beginPath(); ctx.fillStyle = "rgba(88,166,255,0.14)";
        ctx.arc(n.x, n.y, 7 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.fillStyle = COL.node;
        ctx.arc(n.x, n.y, 2.7, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 1.2; ctx.stroke();
      } else {
        ctx.beginPath(); ctx.fillStyle = COL.neighbor;
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // ── zone labels (mono, subtle) for Nordic nodes
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(230,237,243,0.55)";
    ctx.textAlign = "center";
    for (const k in nodes) {
      if (!nodes[k].nordic) continue;
      ctx.fillText(k, nodes[k].x, nodes[k].y - 11);
    }

    raf = requestAnimationFrame(frame);
  }

  let raf;
  function start() { cancelAnimationFrame(raf); layout(); t0 = performance.now(); raf = requestAnimationFrame(frame); }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  layout();
  if (reduce) { frame(performance.now()); cancelAnimationFrame(raf); }
  else { start(); }

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (!reduce) start(); else { layout(); frame(performance.now()); cancelAnimationFrame(raf); } }, 150); });
  // pause when offscreen / tab hidden (saves battery)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduce) start();
  });
})();
