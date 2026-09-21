# Agent Fabric Jumpstarts

A growing library of **how-to** and **demystify** guides for MuleSoft Agent Fabric, published as a
static site and organized the way the product is (Portfolio → Model Proxies → Model Wallets, plus
Governance / Observability / Platform).

**Live site:** https://mulesoft-accelerator.github.io/agent-fabric-jumpstarts/

Built with [Astro](https://astro.build). Guides are authored in Markdown and published to GitHub
Pages automatically on every push to `main`.

---

## How to use this document

| If you are… | Read… |
|-------------|-------|
| **Writing a guide** | [Naming conventions](#naming-conventions) → [Authoring a guide](#authoring-a-guide) → [Best practices](#best-practices) |
| **Adding a new topic/area** | [Content model](#content-model) → [Making an area live](#making-a-coming-soon-area-live) |
| **Working on the site itself** | [Project layout](#project-layout) → [Local development](#local-development) |
| **Setting up publishing** | [How publishing works](#how-publishing-works) |

**The golden rule:** the site is **data-driven from `src/data/site.ts`**. Adding or reorganizing
content means editing that file (and adding Markdown) — you should rarely need to touch the layouts.

---

## Project layout

```
.
├── astro.config.mjs                     # site + base ("/agent-fabric-jumpstarts")
├── package.json / tsconfig.json
├── .github/workflows/deploy.yml         # build + deploy to GitHub Pages on push to main
├── public/                              # served as-is at the site root (favicon.svg, …)
└── src/
    ├── data/
    │   └── site.ts                      # SINGLE SOURCE OF TRUTH: metadata + Agent Fabric
    │                                    #   taxonomy (groups → features → guides)
    ├── components/
    │   └── AppRail.astro                # Agent Fabric-style left nav rail (the "switcher")
    ├── layouts/
    │   ├── BaseLayout.astro             # shell: header, footer, theme toggle, global CSS
    │   ├── DashboardLayout.astro        # BaseLayout + rail + main  (home & area pages)
    │   └── DocLayout.astro              # guide shell: scoped sidebar + on-this-page + prose
    └── pages/
        ├── index.astro                  # /  — dashboard: stats + feature cards by portfolio
        └── model-wallet-guide/          # a feature AREA (the folder name is the area slug)
            ├── index.astro              # /model-wallet-guide/            — area page (cards)
            ├── how-to-create-the-support-team-wallet.md   # a guide
            ├── how-to-test-the-model-wallet.md            # a guide
            └── images/                  # colocated screenshots (auto-optimized → WebP)
```

Generated folders (not committed): `dist/`, `.astro/`, `node_modules/`.

---

## Content model

The taxonomy in `src/data/site.ts` mirrors the Agent Fabric left navigation:

```
MenuGroup   Portfolio · Governance · Observability · Platform
  └─ Feature        e.g. Agents, Model Proxies, APIs …
       ├─ children  (optional) e.g. Model Proxies → Models / Model Wallets / Semantic Services
       └─ guides    (leaf only) the Markdown articles
```

- A **leaf feature with `guides` + a `path`** is **live**: it links to an area page and shows a
  guide count.
- A **leaf feature with no guides** renders automatically as **"Coming soon"** in the rail and on
  the dashboard. This is how we advertise the roadmap — no placeholder pages required.

---

## Naming conventions

Everything is **lowercase kebab-case, ASCII, descriptive** (no spaces, underscores, or camelCase).
Descriptive slugs are deliberate — they are the public URLs, so they carry the SEO.

| Thing | Pattern | Example |
|-------|---------|---------|
| Guide file — *how-to* | `how-to-<verb>-<subject>.md` | `how-to-create-the-support-team-wallet.md` |
| Guide file — *demystify* | `understanding-<subject>.md` | `understanding-model-wallets.md` |
| Area folder | `<area-slug>/` | `model-wallet-guide/` |
| Area page | `index.astro` inside the area folder | `model-wallet-guide/index.astro` |
| Feature `id` (in `site.ts`) | kebab-case of the Agent Fabric feature name | `model-wallets` |
| Guide `href` (in `site.ts`) | `<area-slug>/<guide-slug>/` **with trailing slash** | `model-wallet-guide/how-to-test-the-model-wallet/` |
| Image | `NN-<short-description>.<ext>` (`NN` = step order) | `02-new-budget-01-cost.png` |

**Never name a guide `README.md`.** `README.md` is reserved for repository documentation (this
file). A file named `README` reads as "repo docs," not as an article — and it produces a poor URL.
The original Model Wallet guides were `README.md` / `README-simple.md`; they are now
`how-to-create-the-support-team-wallet.md` / `how-to-test-the-model-wallet.md`.

### URL shape

The repo publishes under a base path. A guide at
`src/pages/model-wallet-guide/how-to-test-the-model-wallet.md` becomes:

```
https://mulesoft-accelerator.github.io/agent-fabric-jumpstarts/model-wallet-guide/how-to-test-the-model-wallet/
```

---

## Authoring a guide

1. Create the Markdown file in the area folder, using the naming convention above.
2. Start it with frontmatter:

   ```markdown
   ---
   layout: ../../layouts/DocLayout.astro
   title: How to <do the thing>
   description: One sentence (≤ ~155 chars) — used for the browser title and SEO meta.
   ---

   # How to <do the thing>

   …content…
   ```

3. Register it in `src/data/site.ts` under the right feature's `guides` array:

   ```ts
   {
     title: 'How to <do the thing>',
     href: 'model-wallet-guide/how-to-do-the-thing/',   // relative to base, trailing slash
     summary: 'One line shown on the dashboard/area cards.',
     updated: '2026-09-21',                             // bump when you revise it
   }
   ```

That's it — the rail, dashboard cards, area page, guide count, and the guide's own sidebar all
update from that data.

### Making a "coming soon" area live

To turn an area (e.g. **Semantic Services**) from *Coming soon* into a real section:

1. In `src/data/site.ts`, give its feature a `path` and a `guides` array.
2. Create the area folder `src/pages/<area-slug>/` with an `index.astro` (copy
   `model-wallet-guide/index.astro` as a template — it derives everything from `locate()`).
3. Add the guide Markdown files. Done — it flips to live automatically.

---

## Best practices

- **Data first.** Add/rename/reorganize content by editing `src/data/site.ts`; avoid touching
  layouts.
- **Relative links only.** Link between guides with relative paths (`../how-to-…/`, `../`) and
  reference images relatively (`images/…`). Absolute paths break under the `/agent-fabric-jumpstarts/`
  base path.
- **One `#` H1 per guide.** Use `##` / `###` for sections — they populate the on-this-page TOC.
- **Keep `updated` honest.** Bump the guide's `updated` date in `site.ts` whenever you revise it;
  it renders on the cards.
- **Colocate images** in the area's `images/` folder, numbered by step. Astro optimizes and
  fingerprints them at build (no manual resizing).
- **Write a real `description`.** It becomes the `<title>` suffix and the meta description — the SEO
  hook.
- **Preview before pushing.** Run `npm run build` (and `npm run preview`) locally; a broken guide
  fails the build.

---

## Local development

Requires Node.js 18.20.8+, 20.3.0+, or 22+.

```bash
npm install
npm run dev      # http://localhost:4321/agent-fabric-jumpstarts/  (live reload)
npm run build    # production build → ./dist
npm run preview  # serve the built ./dist locally
```

---

## How publishing works

`mulesoft-accelerator.github.io` is the organization's GitHub Pages site. Any **other** repo in the
org served via Pages appears at `https://mulesoft-accelerator.github.io/<repo-name>/` — which is why
this repo publishes to `/agent-fabric-jumpstarts/`. That subpath is set by the repo name and mirrored
in `astro.config.mjs` as `base`.

> **One-time setup** (repo **Settings → Pages → Source**): select **GitHub Actions** (not "Deploy
> from a branch" — that's Jekyll, which ignores Astro).

After that, every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and
deploys it to GitHub Pages.
