# kraftatlas-web

Marketing landing page for **Kraftatlas** — the public front door at
[kraftatlas.no](https://kraftatlas.no). One static page that tells the story
(problem → the live map → the flow-based + forecast edge → roadmap) and sends
visitors to the live dashboard.

This repo is intentionally **separate** from the product:

| Repo | What it is | Stack | Deploy |
|---|---|---|---|
| **kraftatlas-web** (this) | The landing page | Static HTML/CSS/JS, no build | GitHub Pages → `kraftatlas.no` |
| [nordic-dashboard](https://github.com/redhus/nordic-dashboard) | The product (the live map) | Python / Dash | Cloud Run → `app.kraftatlas.no` |

Keeping them apart means the landing page stays instant and always-up even when
the dashboard container is cold-starting, and the two have nothing in common to
share (different language, different host). See `DEPLOY.md` for how the domain
points at both.

## Structure

```
index.html              one page, all sections
assets/
  css/style.css         dark theme — tokens mirror the dashboard (theme.py)
  js/grid.js            animated live-flow Nordic grid (real zones + 27 interconnectors)
  js/main.js            sticky-nav state + scroll reveal
  img/                  screenshots of the live dashboard
  brand/                logo / mark / icon (copied from ../brand)
CNAME                   kraftatlas.no  (GitHub Pages custom domain)
.nojekyll               serve assets/ verbatim
robots.txt, sitemap.xml
```

## Run locally

No build step. Any static server works:

```sh
python3 -m http.server 8080      # then open http://localhost:8080
```

## Edit notes

- **Colours / fonts** live in `assets/css/style.css` `:root` and mirror the
  dashboard's `mapboard/theme.py`. Change there.
- **The "open dashboard" links** currently point at the Cloud Run URL. Once the
  custom domain is mapped, swap them to `https://app.kraftatlas.no`
  (search the run.app URL in `index.html`). See `DEPLOY.md`.
- **Screenshots**: regenerate by re-running the playwright capture against the
  live dashboard and replacing the files in `assets/img/`.
- **The hero animation** is pure canvas (`grid.js`) built from the real zone
  centroids + interconnector list — no embed, no heavy dependency. It respects
  `prefers-reduced-motion` and pauses when the tab is hidden.
