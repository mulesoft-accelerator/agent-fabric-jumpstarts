// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// Published as a GitHub Pages "project site":
//   https://mulesoft-accelerator.github.io/agent-fabric-jumpstarts/
// `site` is the org Pages origin; `base` is the repo-name subpath. Every
// internal link/asset must resolve under `base` (use import.meta.env.BASE_URL).
export default defineConfig({
  site: 'https://mulesoft-accelerator.github.io',
  base: '/agent-fabric-jumpstarts',
  // Local SVG icons (reused from MuleSoft Omni) live in src/icons/.
  integrations: [icon({ iconDir: 'src/icons' })],
  markdown: {
    shikiConfig: {
      // Dual themes; class-based dark mode is wired up in BaseLayout.astro.
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
