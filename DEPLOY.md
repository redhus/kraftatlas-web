# Deploy & domain — what to do now that you own the domains

You own **kraftatlas.no**, **kraftatlas.com** and **kraftatlas.online**. Chosen layout:

```
kraftatlas.no            → marketing site  (home + /product)   GitHub Pages, free
app.kraftatlas.no        → the live dashboard                  Cloud Run, already running
kraftatlas.com           → 301 → kraftatlas.no                 redirect
kraftatlas.online        → 301 → kraftatlas.no                 redirect
```

The marketing site is two static pages: `/` (general story + what it is) and
`/product/` (the deep tour). Both link to the app via a single constant —
`APP_URL` in `assets/js/main.js` — which today points at the Cloud Run URL so the
links work the moment `kraftatlas.no` resolves. Once the subdomain mapping below
is live, change that one line to `https://app.kraftatlas.no`.

---

## 1 · Landing page → GitHub Pages (free HTTPS)

This repo already contains `CNAME` (`kraftatlas.no`) and `.nojekyll`.

1. Push the repo to `github.com/redhus/kraftatlas-web` (done by the setup script).
2. GitHub → repo → **Settings → Pages** → Source: **Deploy from a branch** →
   Branch `main`, folder `/ (root)` → Save.
3. Pages will read `CNAME` and show **kraftatlas.no** as the custom domain.
   Tick **Enforce HTTPS** once the cert is issued (a few minutes).

### DNS at your registrar (the `.no` zone)

Apex `kraftatlas.no` → GitHub Pages' four A records (and AAAA for IPv6):

```
Type  Host  Value
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
AAAA  @     2606:50c0:8000::153
AAAA  @     2606:50c0:8001::153
AAAA  @     2606:50c0:8002::153
AAAA  @     2606:50c0:8003::153
CNAME www   redhus.github.io.
```

`www.kraftatlas.no` will then redirect to the apex automatically (GitHub Pages
handles it). DNS can take 10 min–24 h to propagate.

---

## 2 · Dashboard → custom subdomain on Cloud Run

The dashboard already runs at
`https://nordic-dashboard-690238279083.europe-west1.run.app`.

```sh
gcloud beta run domain-mappings create \
  --service nordic-dashboard \
  --domain app.kraftatlas.no \
  --region europe-west1 \
  --project nordic-power-intelligence
```

It prints a DNS record (usually a CNAME → `ghs.googlehosted.com.`, or A/AAAA for
an apex). Add it to the `.no` zone:

```
Type   Host   Value
CNAME  app    ghs.googlehosted.com.      # use exactly what the command prints
```

Google issues a managed TLS cert automatically. When `https://app.kraftatlas.no`
resolves, set `APP_URL = "https://app.kraftatlas.no"` in `assets/js/main.js`
(one line — it rewrites every "Launch the app" link on both pages) and push.

> Verify the domain once in Google Search Console / `gcloud domains verify` if
> the mapping command asks you to.

---

## 3 · kraftatlas.com + kraftatlas.online → redirect to .no

Keep one canonical site. Simplest: at the registrar, use free
**URL forwarding / web redirect** — point both `kraftatlas.com` and
`kraftatlas.online` (and their `www`) to `https://kraftatlas.no` as a
**301 permanent** redirect. (Avoid pointing them at GitHub Pages directly —
Pages serves one custom domain per repo, the one in `CNAME`.)

---

## Checklist

- [ ] Pages enabled, `main` / root, HTTPS enforced
- [ ] `.no` apex A/AAAA records + `www` CNAME added
- [ ] `kraftatlas.no` loads the site over HTTPS (home + `/product/`)
- [ ] Cloud Run domain mapping for `app.kraftatlas.no` created + DNS added
- [ ] `app.kraftatlas.no` serves the dashboard over HTTPS
- [ ] `APP_URL` in `assets/js/main.js` swapped to `https://app.kraftatlas.no`
- [ ] `kraftatlas.com` + `kraftatlas.online` 301-redirect to `kraftatlas.no`
