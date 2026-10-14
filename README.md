# ideal-web-architecture

My ideal web architecture: HTMX and web components running on Node.

## Stack

- **Node.js + TypeScript** — server via `tsx`
- **HTMX** — hypermedia-driven UI
- **EJS** — server-side templating
- **Web Components** — client-side components compiled with esbuild
- **marked** — Markdown rendering

## Structure

```
app/
  server.ts        # Entry point
  routes.ts        # Route definitions
  components/      # TypeScript web components (source)
  constants/       # Shared constants (routes, HTTP, events, etc.)
  decorators/      # TypeScript decorators (e.g. @route)
  helpers/         # Shared utilities (file I/O, router)
  notes/           # Markdown note files
  public/          # Static assets
    components/    # Compiled web components (esbuild output)
    styles/        # CSS (base, layout, utilities, partials)
    htmx.js        # Copied from node_modules on build
  types/           # Shared TypeScript types
  views/           # EJS templates
    partial/       # Partial templates (note-item, notes list)
```

## Dev

```sh
pnpm run build            # copies htmx.js and bundles web components
pnpm run dev              # starts server with file watching (tsx --watch)
pnpm run watch:components # watches and rebuilds web components on change
```
