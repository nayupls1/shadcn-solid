# shadcn-solid: conventions for contributors and agents

A 1:1 port of [shadcn/ui](https://ui.shadcn.com) to **Solid 2.0**, built on
[`base-ui-solidjs`](https://www.npmjs.com/package/base-ui-solidjs) (a Solid 2 port of Base UI),
in two styling variants that look and behave the same:

| Package                  | Path                | Styling                          |
| ------------------------ | ------------------- | -------------------------------- |
| `@shadcn-solid/tailwind` | `packages/tailwind` | Tailwind CSS v4 + `cva` + `cn`   |
| `@shadcn-solid/stylex`   | `packages/stylex`   | StyleX (`@stylexjs/stylex`)      |
| `@shadcn-solid/icons`    | `packages/icons`    | `<Icon icon={...} />` for vanilla `lucide` icon data |
| `www`                    | `apps/www`          | Demo page: every component, Tailwind and StyleX side by side |

`packages/*/src/ui/button.tsx` and `apps/www/src/demos/button.*.tsx` are the reference
implementation. Read them before writing a component.

## Commands

```sh
bun install
bun run dev                    # demo page on http://localhost:3000 (#<name> shows one component)
bun run typecheck              # tsc for every package
bun run build                  # vite build of the demo page
bun run check                  # typecheck + build: must pass before every commit
node scripts/coverage.mjs      # which of the 64 components exist in each variant / have demos
```

## Source of truth

Port shadcn's **Base UI** flavour, style `base-vega` (shadcn's default "new-york" look on Base UI):

- Resolved component source (real Tailwind classes, no `cn-*` placeholders):
  `https://ui.shadcn.com/r/styles/base-vega/<name>.json` → `.files[].content`.
  `registryDependencies` lists the other components it uses.
- Docs and demos: `https://ui.shadcn.com/docs/components/base/<name>`.
- The registry list: `https://ui.shadcn.com/r/styles/base-vega/registry.json`.

Keep every part, export name, `data-slot`, variant and size name, and every class string from the
shadcn source. Change only what React vs Solid forces. `form` is empty in the base registry and is
intentionally not ported (use `field`).

## Solid 2.0 (rc.21) rules

Solid 2 differs from Solid 1. Read `node_modules/solid-js/skills/solid-2.0/SKILL.md` (after
`bun install`; with bun's isolated installs it's at `apps/www/node_modules/solid-js/...`).
The essentials:

- Never destructure props. Use `omit(props, "class", "variant")` (Solid 2 has `omit`/`merge`,
  not `splitProps`/`mergeProps`) and read `props.x` inside JSX or getters.
- `<For each={list}>{(item, index) => ...}</For>`: `item` is a plain value, `index` an accessor.
- `<Show when={x()}>{(value) => value()}</Show>`: the child receives an accessor.
- `createEffect(source, (value) => { ... })` takes a source and a callback. The callback must
  return `undefined` or a cleanup function, never anything else (that halts reactivity).
  Use block bodies.
- Writing a signal from a component body or memo throws unless created with `{ ownedWrite: true }`.
- `JSX`, `Dynamic`, `Portal`, `render` come from `@solidjs/web`; reactivity from `solid-js`.
- Attributes are HTML names: `class`, `for`, `tabindex`, kebab-case `style` keys / strings.
- Events are native: `onInput` for text input changes, `onFocusIn`/`onFocusOut` for bubbling focus.

## base-ui-solidjs

Same parts, props, data attributes and CSS variables as React Base UI
(`https://base-ui.com/react/components/<name>`). Import per component:
`import { Dialog } from "base-ui-solidjs/dialog"`. Differences from React
(full list: https://github.com/nayupls1/base-ui-solid/blob/master/PORTING.md):

- `class` instead of `className` (string or `(state) => string`); `style` is a Solid style.
- `render={<a />}`, `render={(props, state) => <a {...props} />}` or `render="a"`.
- Callback refs only.
- The package's `.d.ts` files (`node_modules/base-ui-solidjs/<part>/*.d.ts`) are the API reference.

Component inventory: accordion, alert-dialog, autocomplete, avatar, button, checkbox,
checkbox-group, collapsible, combobox, context-menu, dialog, direction-provider, drawer, field,
fieldset, form, input, menu, menubar, meter, navigation-menu, number-field, otp-field, popover,
preview-card, progress, radio, radio-group, scroll-area, select, separator, slider, switch, tabs,
toast, toggle, toggle-group, toolbar, tooltip.

## Writing a component

Files: `packages/tailwind/src/ui/<name>.tsx`, `packages/stylex/src/ui/<name>.tsx`,
`apps/www/src/demos/<name>.tailwind.tsx`, `apps/www/src/demos/<name>.stylex.tsx`.
Demos are picked up by `import.meta.glob`, so there is no shared registry file to edit.
Each demo's default export renders shadcn's main docs demo for that component (both demos
render the same thing; port the shadcn demo content).

Import sibling components relatively (`../ui/button` from a ui file, `../lib/utils`).

### Tailwind variant

- Copy the shadcn source, swap `@base-ui/react/<x>` for `base-ui-solidjs/<x>`,
  `className` → `class`, and `cn` from `../lib/utils`.
- Props type: `Omit<Primitive.Props, "class"> & { class?: string }` (shadcn passes `className`
  straight into `cn`, so it only supports strings too).
- `lucide-react` icons → `import { ChevronDown } from "lucide"` + `<Icon icon={ChevronDown} />`
  from `@shadcn-solid/icons` (Solid 1's `lucide-solid` doesn't work with Solid 2).
- Tailwind custom variants used by shadcn (`data-open:`, `data-checked:`, ...) come from
  `src/styles/shadcn.css`, vendored from the shadcn package.

### StyleX variant

- Same parts, exports, `data-slot`s, variant/size names and props as the Tailwind variant,
  plus an optional `xstyle?: stylex.StyleXStyles` override merged last.
- Translate each Tailwind class to StyleX by its exact CSS value (Tailwind v4 spacing is
  `0.25rem` per step; `text-sm` is `0.875rem / 1.25rem`). Theme tokens: `colors.*` and
  `radius.*` from `../tokens.stylex` mirror the CSS variables 1:1.
- `bg-primary/80` → `` `color-mix(in oklch, ${colors.primary} 80%, transparent)` ``.
  Values in `stylex.create` must be static: template literals with tokens are fine, calls to
  imported helper functions are not.
- `dark:` overrides → `` `light-dark(${light}, ${dark})` `` (colors only; `darkMode` from
  `lib/theme.ts` sets `color-scheme`).
- Pseudo-classes as conditional values: `{ default: x, ":hover": y }`. Attribute conditions on the
  element itself work as pseudo-class strings: `":is([data-disabled])"`, `":is([aria-expanded=true])"`.
- State that depends on Base UI state: prefer Base UI's function `class`, e.g.
  `class={(state) => cx(stylex.attrs(styles.base, state.open && styles.open).class, props.class)}`,
  or data-attribute pseudo-classes as above.
- Descendant/ancestor selectors (`[&_svg]`, `group-data-*`, `in-data-*`, `has-*`) don't exist
  in StyleX: style the child part directly, use `stylex.when.ancestor(...)`/`stylex.defaultMarker()`
  where it fits, or pass state down. `Icon` defaults to 16px for the common `[&_svg]:size-4`.
- Keyframes: `stylex.keyframes`. tw-animate-css enter/exit animations (`data-open:animate-in
  fade-in-0 zoom-in-95`...) → keyframes keyed on `:is([data-open])`/`:is([data-starting-style])`
  etc. Match durations and transforms.
- Spread with `class`/`style`, not `{...stylex.props()}` (that's React's `className`):
  `stylex.attrs()` returns `{ class, style }`, `cx()` in `lib/utils.ts` joins classes.

## Third-party React libraries

shadcn uses some React-only libraries. Don't pull in Solid 1 libraries (they break on Solid 2).

| Component    | shadcn uses              | Here                                                         |
| ------------ | ------------------------ | ------------------------------------------------------------ |
| input-otp    | `input-otp`              | `base-ui-solidjs/otp-field`                                  |
| sonner       | `sonner`                 | `toast()` + `<Toaster />` with sonner's API, on base-ui toast |
| calendar     | `react-day-picker`       | Own month grid with `date-fns`; single, multiple, range modes; same slots/classes |
| carousel     | `embla-carousel-react`   | `embla-carousel` (vanilla core) in a Solid context           |
| command      | `cmdk`                   | Own implementation of cmdk's parts, filtering and keyboard nav |
| resizable    | `react-resizable-panels` | Own `ResizablePanelGroup/Panel/Handle` (pointer + keyboard)  |
| chart        | `recharts`               | shadcn's chart API (`ChartContainer`, config, tooltip, legend) over small SVG bar/line/area primitives |
| code-block   | `shiki`                  | `shiki` (framework-agnostic) with the same hook logic        |

## Commits and PRs

- Run `bun run check` and `node scripts/coverage.mjs` before each commit; both must pass.
- One commit per component or small group (`feat(tailwind,stylex): dialog`).
- Look at both variants side by side in the demo page (light and dark) before calling a component
  done. Headless browsers only.
