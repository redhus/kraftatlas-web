# Deploy & domain — what to do now that you own the domains

You own **kraftatlas.no** and **kraftatlas.com**. Goal:

```
kraftatlas.no            → this landing page          (GitHub Pages, free)
app.kraftatlas.no        → the live dashboard          (Cloud Run, already running)
kraftatlas.com / .no →  …com 301-redirects to .no  (one canonical site)
```

Recommendation: **landing page on the apex (`kraftatlas.no`), product on a
subdomain (`app.kraftatlas.no`).** A subdomain is a one-record Cloud Run mapping
and needs no load balancer. (A path like `kraftatlas.no/product` would require a
reverse proxy / HTTPS load balancer in front of both — more moving parts and a
small monthly cost — so prefer the subdomain unless you specifically want the
path.) Either way the landing page CTA is just a link; update it in `index.html`.

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
resolves, **update `index.html`**: replace every
`https://nordic-dashboard-690238279083.europe-west1.run.app`
with `https://app.kraftatlas.no` and push.

> Verify the domain once in Google Search Console / `gcloud domains verify` if
> the mapping command asks you to.

---

## 3 · kraftatlas.com → redirect to .no

Keep one canonical site. Two easy options:

- **At the registrar:** most (Domeneshop, Namecheap, etc.) offer free
  "URL forwarding / web redirect" — point `kraftatlas.com` (and `www`) to
  `https://kraftatlas.no` as a **301 permanent** redirect. Simplest.
- **Or** add `.com` as a second custom domain on a tiny redirect host. The
  registrar option is fine and free.

---

## Checklist

- [ ] Pages enabled, `main` / root, HTTPS enforced
- [ ] `.no` apex A/AAAA records + `www` CNAME added
- [ ] `kraftatlas.no` loads this page over HTTPS
- [ ] Cloud Run domain mapping for `app.kraftatlas.no` created + DNS added
- [ ] `app.kraftatlas.no` serves the dashboard over HTTPS
- [ ] `index.html` links swapped to `https://app.kraftatlas.no`
- [ ] `kraftatlas.com` 301-redirects to `kraftatlas.no`
