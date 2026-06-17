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

Two static pages, no build:

```
index.html              home — general story + "what it is" + roadmap
product/index.html      the deep tour: live map, flow-based, forecast, pipeline
assets/
  css/style.css         dark theme — tokens mirror the dashboard (theme.py)
  js/main.js            APP_URL constant + sticky-nav state + scroll reveal
  img/                  screenshots of the live dashboard
  video/                nordic-flow.{mp4,webm} hero clip + poster (cropped from a screen recording)
  brand/                logo / mark / icon (copied from ../brand)
CNAME                   kraftatlas.no  (GitHub Pages custom domain)
.nojekyll               serve assets/ verbatim
robots.txt, sitemap.xml
```

All paths are root-absolute (`/assets/…`, `/product/`) — correct under the
custom domain. Every "Launch the app" link carries `data-app` and gets its href
from the single `APP_URL` constant in `assets/js/main.js`.

## Run locally

No build step. Any static server works:

```sh
python3 -m http.server 8080      # then open http://localhost:8080
```

## Edit notes

- **Colours / fonts** live in `assets/css/style.css` `:root` and mirror the
  dashboard's `mapboard/theme.py`. Change there.
- **The "Launch the app" links** all read from `APP_URL` in `assets/js/main.js`.
  Today it's the Cloud Run URL; once `app.kraftatlas.no` is mapped, change that
  one line. See `DEPLOY.md`.
- **Screenshots**: regenerate by re-running the playwright capture against the
  live dashboard and replacing the files in `assets/img/`.
- **The hero clip** is a screen recording of the live dashboard's center map,
  cropped square and compressed to `assets/video/nordic-flow.{mp4,webm}` with a
  `-poster` still. To refresh it: record the map area, then
  `ffmpeg -i mac_record.mov -vf "crop=W:H:X:Y,scale=1080:1080,fps=30" -c:v libx264 -crf 21 -pix_fmt yuv420p -movflags +faststart -an nordic-flow.mp4`
  (and a `libvpx-vp9` pass for the webm). The raw `.mov` is git-ignored — only the
  optimized files are committed. Under `prefers-reduced-motion` it holds on the poster.
