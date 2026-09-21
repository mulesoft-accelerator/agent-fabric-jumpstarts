# Agent Fabric Jumpstarts

Hands-on, copy-and-paste guides for getting productive with MuleSoft Agent Fabric.

**Live site:** https://mulesoft-accelerator.github.io/agent-fabric-jumpstarts/

This repo is an [Astro](https://astro.build) static site. Guides are authored in Markdown
and published to GitHub Pages automatically on every push to `main`.

## Project layout

```
src/
  pages/
    index.astro                     → /                       (landing page)
    model-wallet-guide/
      index.md                      → /model-wallet-guide/     (create the wallet)
      test.md                       → /model-wallet-guide/test/ (test the wallet)
      images/                       colocated screenshots (optimized by Astro)
  layouts/
    BaseLayout.astro                page shell: header, footer, theme toggle, global styles
    DocLayout.astro                 doc shell: sidebar nav + on-this-page + prose styles
  data/
    site.ts                         site metadata + navigation (edit this to add guides)
public/                             static assets served as-is (favicon, etc.)
astro.config.mjs                    site + base ("/agent-fabric-jumpstarts") config
.github/workflows/deploy.yml        builds and deploys to GitHub Pages
```

## Local development

Requires Node.js 18.20.8+, 20.3.0+, or 22+.

```bash
npm install
npm run dev      # http://localhost:4321/agent-fabric-jumpstarts/
npm run build    # output to ./dist
npm run preview  # serve the production build locally
```

## Adding a guide

1. Add a Markdown file under `src/pages/` (a folder with `index.md` gives a clean URL).
2. Start the file with frontmatter:

   ```markdown
   ---
   layout: ../../layouts/DocLayout.astro
   title: My guide title
   description: One-line summary for SEO and cards.
   ---

   # My guide title
   ...
   ```

3. Register it in `src/data/site.ts` so it appears in the sidebar, header, and landing cards.
4. Use **relative** links between pages (e.g. `test/`, `../`) and **relative** image paths
   (`images/...`) so everything resolves correctly under the `/agent-fabric-jumpstarts/` base path.

## How publishing works

`mulesoft-accelerator.github.io` is the organization's GitHub Pages site. Any other repo in the
org served via Pages appears at `https://mulesoft-accelerator.github.io/<repo-name>/` — which is why
this repo publishes to `/agent-fabric-jumpstarts/`. The subpath is set by the repo name and mirrored
in `astro.config.mjs` as `base`.

One-time setup (repo **Settings → Pages**): set **Source** to **GitHub Actions**. After that, every
push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys it.
