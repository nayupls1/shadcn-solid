# shadcn-solid

[shadcn/ui](https://ui.shadcn.com) for **Solid 2.0**, built on
[`base-ui-solidjs`](https://www.npmjs.com/package/base-ui-solidjs). It's a 1:1 port of shadcn's
Base UI flavour (style `base-vega`): the same parts, exports, `data-slot`s, variants and sizes,
in two styling variants that look and behave the same:

- `@shadcn-solid/tailwind`: Tailwind CSS v4, with the same class strings as shadcn's components.
- `@shadcn-solid/stylex`: the same components styled with [StyleX](https://stylexjs.com).

## The demo page

```sh
bun install
bun run dev      # http://localhost:3000
```

The demo page (`apps/www`) shows every component's main shadcn docs example twice, side by side:
the Tailwind version on the left, the StyleX one on the right. The sidebar lists all 64 components;
`/` shows them all on one page and `#<name>` (e.g. `#dialog`) shows one. The button in the top
right switches between light and dark mode.

```sh
bun run check                  # typecheck + production build
node scripts/coverage.mjs      # which components exist in each variant and have demos
```

## Using the components

```tsx
import "@shadcn-solid/tailwind/globals.css"
import { Button } from "@shadcn-solid/tailwind/ui/button"
// or
import { Button } from "@shadcn-solid/stylex/ui/button"

<Button variant="outline">Click me</Button>
```

The StyleX variant needs the StyleX compiler (see `apps/www/vite.config.ts`). Dark mode: add the
`dark` class to `<html>` for Tailwind; for StyleX, apply `stylex.attrs(darkMode)` in dark mode and
`stylex.attrs(lightMode)` in light mode (both from `@shadcn-solid/stylex/lib/theme`; StyleX's
`light-dark()` fallback needs one of them on an ancestor).

Every StyleX component also takes an `xstyle` prop: StyleX styles merged last.

## Components

All 64 components of shadcn's base registry (`form` is empty there; use `field`):

| | | | |
| --- | --- | --- | --- |
| accordion | alert | alert-dialog | aspect-ratio |
| attachment | avatar | badge | breadcrumb |
| bubble | button | button-group | calendar |
| card | carousel | chart | checkbox |
| code-block | collapsible | combobox | command |
| context-menu | dialog | direction | drawer |
| dropdown-menu | empty | field | hover-card |
| input | input-group | input-otp | item |
| kbd | label | marker | menubar |
| message | message-scroller | native-select | navigation-menu |
| pagination | popover | progress | questionnaire |
| radio-group | resizable | scroll-area | select |
| separator | sheet | sidebar | skeleton |
| slider | sonner | spinner | switch |
| table | tabs | textarea | toast |
| toggle | toggle-group | tooltip | trace |

shadcn uses a few React-only libraries; these are replaced as follows (details in
[AGENTS.md](AGENTS.md)):

| Component | shadcn uses | Here |
| --- | --- | --- |
| input-otp | `input-otp` | `base-ui-solidjs/otp-field` |
| sonner | `sonner` | `toast()` + `<Toaster />` with sonner's API, on Base UI's toast manager |
| calendar | `react-day-picker` | own month grid on `date-fns` (single, multiple, range) with react-day-picker's DOM |
| carousel | `embla-carousel-react` | `embla-carousel` (the framework-agnostic core) |
| command | `cmdk` | own port of cmdk's parts, filtering and keyboard navigation |
| resizable | `react-resizable-panels` | own panel group, panels and handles (pointer and keyboard) |
| chart | `recharts` | shadcn's chart API over small SVG bar, line and area primitives |
| code-block | `shiki` | `shiki` |
| message-scroller, questionnaire | `@shadcn/react` | `@shadcn-solid/primitives` (`packages/primitives`) |

## Known gaps

- **Children and descendant selectors in StyleX.** StyleX styles an element only through its
  own class, so shadcn rules that reach into arbitrary children (`[&_a]`, `[&_p]`, `*:[img]`,
  `[&_svg]` sizes) aren't reproduced for content you pass in: links and paragraphs inside alert,
  empty, item, field and accordion descriptions keep their own styles, and icons inside buttons
  default to 16px (pass `size` for others). The components' own parts are styled through context,
  markers or conditions on the part itself, and look the same as in Tailwind.
- **calendar** doesn't support react-day-picker's `components`, `modifiers`, `timeZone`, RTL or
  `footer`.
- **input-otp** has one real input per slot (Base UI), so there's no fake caret, and no `pattern`
  prop (use `validationType`).
- **sonner** has no per-toast `position` and supports one Toaster per package.
- **command** doesn't re-sort matches by score, and keeps filtered-out items mounted (hidden).
- **scroll-fade** (code-block, attachment group, message-scroller) needs scroll-driven
  animations; browsers without them show no fade in StyleX (shadcn shows a static one).
- In development, Solid prints `EFFECT_WRITES_OWN_SOURCE`, `EFFECT_RELAY_TEAR` and
  `STRICT_READ_UNTRACKED` diagnostics from inside base-ui-solidjs (avatar, menus, select, sliders)
  and one from the combobox trigger. They don't affect behaviour and don't appear in production.

See [AGENTS.md](AGENTS.md) for the conventions used to port components.
