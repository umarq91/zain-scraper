# CLAUDE.md

Architecture and collaboration guide for this codebase.

---

## Commands

```bash
npm run dev        # Start Next.js dev server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
```

---

## Stack

Next.js 15 + React 19 + TypeScript + Tailwind CSS + Supabase SSR + Framer Motion

---

## File & Folder Structure

```
src/
├── app/                      # Next.js App Router — pages and API routes
│   ├── api/                  # Server-side route handlers (Supabase calls live here)
│   ├── dashboard/page.tsx    # Auth-gated redirect shell
│   ├── login/                # Login page
│   ├── settings/             # Settings page
│   ├── _dashboard.tsx        # Dashboard client component
│   ├── _landing.tsx          # Landing page client component
│   ├── globals.css           # Tailwind base + CSS custom properties
│   ├── layout.tsx            # Root layout (fonts, metadata)
│   └── page.tsx              # Root page (auth redirect → landing or dashboard)
│
├── components/
│   ├── layout/               # Shell components reused across pages (AppHeader, etc.)
│   └── shared/               # Generic zero-logic components (Bracket, etc.)
│
├── constants/                # App-wide constants — one file per domain
│   ├── routes.ts
│   └── sizes.ts
│
├── hooks/                    # Custom React hooks — wrap models, expose clean state
│   ├── useDashboard.ts
│   ├── useProducts.ts
│   └── useSettings.ts
│
├── lib/                      # Pure utility functions — no React, no side effects
│   └── utils.ts
│
├── models/                   # API client layer — all fetch() calls to /api/* routes
│   ├── ProductModel.ts
│   └── SettingsModel.ts
│
├── types/                    # Global TypeScript types
│   └── index.ts
│
└── utils/supabase/           # Supabase client helpers (SSR boilerplate)
    ├── client.ts
    ├── server.ts
    └── middleware.ts
```

---

## Routing

Next.js App Router. Pages live in `src/app/`. No client-side router library. Navigation uses `<Link>` and `useRouter()` from `next/navigation`.

---

## Auth Flow

Server components check `supabase.auth.getUser()` at the page level and redirect. Client components use `createClient()` from `@/utils/supabase/client` only for auth state (`signOut`, `getUser`). All data queries go through API routes, never direct Supabase in client components.

---

## Models (API Client Layer)

All `fetch()` calls to `/api/*` routes live in `src/models/` as **static class methods**. Components and hooks never call `fetch()` directly.

```ts
// src/models/ProductModel.ts
export class ProductModel {
  static async list(): Promise<Product[]> {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
  }
}
```

### Model Rules

- One file per domain (`ProductModel`, `SettingsModel`)
- All methods are `static async`
- Always throw on error — let the caller handle it
- Never transform or format data inside models — return raw API shape

---

## Hooks (`src/hooks/`)

Custom hooks wrap model calls and expose clean `loading / error / data` state. Components never call models directly.

```ts
// src/hooks/useProducts.ts
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  // ...
  return { products, loading, addProduct, removeProduct, updateProduct };
}
```

---

## Constants (`src/constants/`)

Every magic string, number, or array used in more than one place lives here.

```ts
// src/constants/sizes.ts
export const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof ALL_SIZES)[number];
```

Never inline size arrays, route strings, or interval values in components.

---

## Helpers (`src/lib/`)

Pure utility functions — no hooks, no JSX, no side effects.

```ts
// src/lib/utils.ts
export function cleanUrl(url: string): string { ... }
export function formatHandle(handle: string): string { ... }
export function formatStoreDomain(url: string): string { ... }
```

---

## Design System

All UI uses the design token CSS custom properties defined in `globals.css`. Never use raw hex values in components.

| Token | Value | Usage |
|---|---|---|
| `var(--accent)` | `#F26B1F` | Primary accent, CTAs, available state |
| `var(--accent-deep)` | `#D9551A` | Accent hover/active |
| `var(--accent-soft)` | `#FFE6D4` | Accent tint backgrounds |
| `var(--ink)` | `#0A0A0A` | Primary text, borders |
| `var(--ink-soft)` | `#2A2A2A` | Secondary text |
| `var(--paper)` | `#FAFAF7` | Page background |
| `var(--paper-pure)` | `#FFFFFF` | Card surfaces |
| `var(--grid-line)` | `#E4E4E0` | Borders, dividers, skeleton |

**Tailwind tokens** (configured in `tailwind.config.ts`):
- Colors: `accent`, `ink`, `paper`, `paper-pure`, `grid-line`, `ink-soft`
- Shadows: `shadow-hard`, `shadow-hard-sm`, `shadow-hard-lg`, `shadow-hard-accent`
- Fonts: `font-display`, `font-body`, `font-mono`

**Utility classes** (in `globals.css`):
- `.bg-grid` — grid-pattern background
- `.focus-hard` — accent hard-shadow focus ring
- `.hover-lift` — hard-shadow lift on hover

**Semantic conventions:**
- Accent orange → available / in-stock / primary action
- Strikethrough + `opacity-30` → sold-out
- `opacity-60` + neutral border → paused

---

## Component Rules

- **One component per file.** If a file exports more than one component, split it.
- **No barrel files** — import directly, never `index.ts` re-exporting everything.
- **Shared components** in `components/shared/` must have zero page-specific logic.
- **Layout components** in `components/layout/` are structural shells — they don't fetch data.
- Components receive data via props — they never call models or fetch directly.
- Data fetching belongs in hooks (`src/hooks/`), which call models.
- No `useEffect` for derived state — compute inline or use `useMemo`.
- Prefer early returns over nested ternaries.

```tsx
// ✅ Good
if (loading) return <Skeleton />
if (!data) return <EmptyState />
return <ProductGrid products={data} />

// ❌ Bad
return loading ? <Skeleton /> : !data ? <EmptyState /> : <ProductGrid products={data} />
```

### Inline vs Extract

Only extract a sub-component when:
- It is reused across files, **or**
- It meaningfully improves clarity and separation of concerns

If used only once in a file and is small, keep it inline. Never create a component just to name a chunk of JSX.

```tsx
// ❌ Avoid (unnecessary extraction — used once, trivial)
const Parent = () => <Child />
const Child = () => <div>Content</div>

// ✅ Prefer (inline if used once and small)
const Parent = () => <div>Content</div>
```

---

## Code Quality Rules

- **Never use `any`** — use `unknown` + narrowing, or define a proper type in `src/types/`.
- No unused imports — lint before committing.
- No commented-out code — delete it.
- No magic strings or numbers inline — use `src/constants/`.
- No `console.log` in components.
- Keep files under ~150 lines — if longer, extract hooks or split components.
- Prefer `const` arrow functions for components.
- Default to writing **no comments** — only add one when the WHY is non-obvious.
