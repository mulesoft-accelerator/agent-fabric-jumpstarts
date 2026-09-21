// Site metadata + the MuleSoft Agent Fabric taxonomy that organizes the library.
//
// The structure mirrors the Agent Fabric left-hand navigation:
//   Portfolio / Governance / Observability / Platform  (groups)
//     -> features (e.g. Agents, Model Proxies, APIs ...)
//        -> some features have sub-features (Model Proxies -> Model Wallets ...)
//
// A "leaf" feature (one with no children) can carry `guides`. A leaf with
// guides also gets an area page at `path`; leaves without guides render as
// "Coming soon". Adding content never touches the layouts — edit this file.

export const site = {
  title: 'Agent Fabric Jumpstarts',
  tagline:
    'A growing library of how-to and demystify guides for MuleSoft Agent Fabric — organized the way the product is.',
  repo: 'https://github.com/mulesoft-accelerator/agent-fabric-jumpstarts',
};

export interface Guide {
  title: string;
  /** Relative to BASE_URL, no leading slash. */
  href: string;
  summary?: string;
  /** ISO date (YYYY-MM-DD) the guide was last updated. */
  updated?: string;
}

export interface Feature {
  name: string;
  /** URL-safe id, also used as the client anchor. */
  id: string;
  /** Emoji marker shown in the rail and cards. */
  icon?: string;
  /** Area page path (relative to BASE_URL). Present when the feature has guides. */
  path?: string;
  /** Sub-features (e.g. Model Proxies -> Models / Model Wallets / ...). */
  children?: Feature[];
  /** Guides for a leaf feature. */
  guides?: Guide[];
}

export interface MenuGroup {
  group: string;
  features: Feature[];
}

const modelWalletGuides: Guide[] = [
  {
    title: 'How to create the Support Team Wallet',
    href: 'model-wallet-guide/how-to-create-the-support-team-wallet/',
    summary:
      'Stand up a Model Wallet with per-team spending and token limits in a few clicks.',
    updated: '2026-09-21',
  },
  {
    title: 'How to test the Model Wallet',
    href: 'model-wallet-guide/how-to-test-the-model-wallet/',
    summary:
      'Copy-and-paste checks that the wallet matches, enforces budgets, and reports usage.',
    updated: '2026-09-21',
  },
];

export const menu: MenuGroup[] = [
  {
    group: 'Portfolio',
    features: [
      { name: 'Agents', id: 'agents', icon: '🤖' },
      { name: 'MCP Servers', id: 'mcp-servers', icon: '🔌' },
      {
        name: 'Model Proxies',
        id: 'model-proxies',
        icon: '🧭',
        children: [
          { name: 'Models', id: 'models', icon: '◇' },
          {
            name: 'Model Wallets',
            id: 'model-wallets',
            icon: '👛',
            path: 'model-wallet-guide/',
            guides: modelWalletGuides,
          },
          { name: 'Semantic Services', id: 'semantic-services', icon: '🧠' },
        ],
      },
      { name: 'APIs', id: 'apis', icon: '🌐' },
      { name: 'Gateways', id: 'gateways', icon: '🚦' },
    ],
  },
  {
    group: 'Governance',
    features: [
      { name: 'Cost Management', id: 'cost-management', icon: '💳' },
      { name: 'Security', id: 'security', icon: '🛡️' },
      { name: 'Governance Strategies', id: 'governance-strategies', icon: '📐' },
    ],
  },
  {
    group: 'Observability',
    features: [
      { name: 'Performance', id: 'performance', icon: '📊' },
      { name: 'Notifications', id: 'notifications', icon: '🔔' },
    ],
  },
  {
    group: 'Platform',
    features: [{ name: 'Providers', id: 'providers', icon: '🧩' }],
  },
];

/** Join the site base with a relative href (handles the trailing slash). */
export function withBase(href: string): string {
  const base = import.meta.env.BASE_URL; // e.g. "/agent-fabric-jumpstarts/"
  return base.replace(/\/$/, '') + '/' + href.replace(/^\//, '');
}

/** Format an ISO date (YYYY-MM-DD) as e.g. "Sep 21, 2026", parsed in UTC. */
export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export interface Located {
  group: string;
  /** The parent feature when the match is a sub-feature (e.g. Model Proxies). */
  parent?: Feature;
  feature: Feature;
  /** Set when the path matched a specific guide rather than the area page. */
  guide?: Guide;
}

/** Total number of published guides across the whole library. */
export function guideCount(): number {
  let n = 0;
  for (const g of menu)
    for (const f of g.features)
      for (const leaf of f.children ?? [f]) n += leaf.guides?.length ?? 0;
  return n;
}

/** Find which group/feature/guide a given pathname belongs to. */
export function locate(pathname: string): Located | undefined {
  const norm = pathname.replace(/\/+$/, '');
  const eq = (href: string) => withBase(href).replace(/\/+$/, '') === norm;
  for (const g of menu) {
    for (const f of g.features) {
      const leaves = f.children ?? [f];
      const parent = f.children ? f : undefined;
      for (const leaf of leaves) {
        if (leaf.path && eq(leaf.path)) return { group: g.group, parent, feature: leaf };
        for (const guide of leaf.guides ?? []) {
          if (eq(guide.href)) return { group: g.group, parent, feature: leaf, guide };
        }
      }
    }
  }
  return undefined;
}
