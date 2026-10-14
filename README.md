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

## Resources

- [HTMX](https://htmx.org/docs/)
- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [Custom Events](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [CSS @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)
- [CSS @scope](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope)
- [CSS Nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting)
- [BEM](https://getbem.com/)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [EJS](https://ejs.co/)
- [marked](https://marked.js.org/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [esbuild](https://esbuild.github.io/)

## Experimental / Limited Support

- [CSS `field-sizing`](https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing) — sizes `<textarea>` to its content; Chromium-only as of late 2025
- [CSS `lh` unit](https://developer.mozilla.org/en-US/docs/Web/CSS/length#lh) — relative to the element's line-height; supported in modern browsers since 2023
