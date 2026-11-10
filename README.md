# shadcn-solid

[shadcn/ui](https://ui.shadcn.com) for **Solid 2.0**, built on
[`base-ui-solidjs`](https://www.npmjs.com/package/base-ui-solidjs), in two styling variants:

- `@shadcn-solid/tailwind`: Tailwind CSS v4, the same class strings as shadcn's Base UI components.
- `@shadcn-solid/stylex`: the same components styled with [StyleX](https://stylexjs.com).

```sh
bun install
bun run dev      # demo page with every component, Tailwind and StyleX side by side
bun run check    # typecheck + build
```

```tsx
import "@shadcn-solid/tailwind/globals.css"
import { Button } from "@shadcn-solid/tailwind/ui/button"
// or
import { Button } from "@shadcn-solid/stylex/ui/button"

<Button variant="outline">Click me</Button>
```

The StyleX variant needs the StyleX compiler (see `apps/www/vite.config.ts`). Dark mode: add the
`dark` class to `<html>` for Tailwind, and `stylex.attrs(darkMode)` from
`@shadcn-solid/stylex/lib/theme` for StyleX.

See [AGENTS.md](AGENTS.md) for the conventions used to port components.
