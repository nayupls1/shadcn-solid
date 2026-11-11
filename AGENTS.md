# shadcn-solid: conventions for contributors and agents

A 1:1 port of [shadcn/ui](https://ui.shadcn.com) to **Solid 2.0**, built on
[`base-ui-solidjs`](https://www.npmjs.com/package/base-ui-solidjs) (a Solid 2 port of Base UI),
in two styling variants that look and behave the same:

| Package                  | Path                | Styling                          |
| ------------------------ | ------------------- | -------------------------------- |
| `@shadcn-solid/tailwind` | `packages/tailwind` | Tailwind CSS v4 + `cva` + `cn`   |
| `@shadcn-solid/stylex`   | `packages/stylex`   | StyleX (`@stylexjs/stylex`)      |
| `@shadcn-solid/icons`    | `packages/icons`    | `<Icon icon={...} />` for vanilla `lucide` icon data |
| `@shadcn-solid/primitives` | `packages/primitives` | Unstyled ports of shadcn's `@shadcn/react` primitives (MessageScroller, Questionnaire) |
| `www`                    | `apps/www`          | Demo page: every component, Tailwind and StyleX side by side |
| `shadcn-solid` (CLI)     | `packages/cli`      | `init`/`add`/`list`: copies the components into a user's project, shadcn-style |

Users don't depend on these packages: like shadcn/ui, the CLI copies the source into their
project. The packages are the source of truth the CLI's registry is generated from.

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
bun run cli -- add button --cwd /abs/path/to/app   # run the CLI from source
bun run cli:build              # standalone executables in packages/cli/dist
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
- Boolean `data-*` attributes render as empty attributes (`data-active=""`), so shadcn's
  `data-[active=true]:` selectors never match. Pass strings: `data-active={String(active())}`,
  or `undefined` to omit the attribute.

## base-ui-solidjs

Same parts, props, data attributes and CSS variables as React Base UI
(`https://base-ui.com/react/components/<name>`). Import per component:
`import { Dialog } from "base-ui-solidjs/dialog"`. Differences from React
(full list: https://github.com/nayupls1/base-ui-solid/blob/master/PORTING.md):

- `class` instead of `className` (string or `(state) => string`); `style` is a Solid style.
- `render={<a />}`, `render={(props, state) => <a {...props} />}` or `render="a"`. With a
  **component**, always use the function form: `render={(p) => <Button {...p} variant="outline" />}`.
  A component element (`render={<Button />}`) is lazy in Solid 2, so it's treated as a render
  function and loses Base UI's props and children. Plain elements can keep the element form.
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
- `dark:` overrides → `` `light-dark(${light}, ${dark})` `` (colors only). StyleX compiles
  `light-dark()` to a lightningcss fallback that reads variables only `darkMode`/`lightMode` from
  `lib/theme.ts` define, so one of them must be on an ancestor (the demo's `App.tsx` toggles both).
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
  To also keep a consumer's `style`, use `mergeStyle()` (`lib/style.ts`) or `sxMerge()`
  (`lib/sx.ts`, attrs + class + style in one call); both accept Base UI's `(state) => style`.
- Call `stylex.when.*`, `stylex.keyframes` etc. inline where StyleX expects them. A hoisted
  `const inTooltip = stylex.when.ancestor(...)` used as a computed key isn't compiled: it throws
  "Unexpected 'stylex.when.ancestor' call at runtime", which `bun run check` doesn't catch.
- StyleX lets longhands win over shorthands regardless of order. The Button's sizes set
  `paddingLeft`/`paddingRight`, so a part that overrides a Button's padding must override those
  (not `paddingInline`/`padding`).
- Parts inside a `ButtonGroup` spread `buttonGroupItemStyles.item` (from `ui/button-group.tsx`):
  Tailwind's group styles its children, StyleX children have to opt in (Button, Input and
  SelectTrigger do).

### Shared StyleX helpers

- `lib/markers.stylex.ts`: named `stylex.defineMarker()`s for Tailwind's `group/*`/`peer` variants
  (`groupMarker`, `peerMarker`, `fieldMarker`, `tooltipContentMarker`, ...); some components keep
  theirs in `lib/markers/<component>.stylex.ts`. Prefer a named marker to
  `stylex.defaultMarker()`, which matches any marked ancestor.
- `lib/animate.ts`: tw-animate-css (`animate-in`/`animate-out`, fade, zoom, slide) with the same
  keyframes and variables.
- `lib/scroll-fade.ts`: shadcn's `scroll-fade-x`/`-y`/`-b` edge masks.
- `lib/a11y.ts` (`sr-only`), `lib/shimmer.ts`, `lib/theme.ts` (`lightMode`/`darkMode`).
- Components that need a React-only library's behaviour share a framework-agnostic core between
  both packages (`lib/cmdk.tsx`, `lib/calendar-core.tsx`, `lib/resizable-panels.tsx`,
  `lib/chart-primitives.tsx`, `lib/highlighter.tsx`).

## The CLI and its registry

`packages/cli/scripts/build-registry.ts` (run by `bun run typecheck`) generates
`packages/cli/src/registry.generated.json` (gitignored) from `packages/{tailwind,stylex}/src`,
`packages/icons` and `packages/primitives`, and `bun build --compile` embeds it in the executable.
It follows every import to compute each component's files and npm dependencies, so:

- Import other source files relatively, or through `@shadcn-solid/icons` /
  `@shadcn-solid/primitives/<export>`. An import that doesn't resolve fails the build.
- Every source file must be reachable from some component (or from `init`'s base files). A file
  only a demo imports (like `hooks/use-highlighted-code.ts`) goes in `EXTRA_FILES` for its
  component; otherwise the build fails on dead files.
- npm versions come from the source packages' `package.json` (`dependencies`, then
  `peerDependencies`): add new packages there.
- In a project, `ui/*` goes to `aliases.ui`, `lib/*` and `tokens.stylex.ts` to `aliases.lib`,
  `hooks/*` to `aliases.hooks`, `@shadcn-solid/icons` to `ui/icon.tsx`, primitives to
  `lib/primitives/*`, and `styles/shadcn.css` next to the user's CSS file. Imports between copied
  files are rewritten to relative paths.

Pushing a `v*` tag runs `.github/workflows/release.yml`: it compiles Linux x64/arm64 and
Windows x64 executables, runs `packages/cli/scripts/smoke.sh` on each OS, and creates the release.

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
| message-scroller, questionnaire | `@shadcn/react` | `@shadcn-solid/primitives` (unstyled Solid ports)  |

## Commits and PRs

- Run `bun run check` and `node scripts/coverage.mjs` before each commit; both must pass.
- One commit per component or small group (`feat(tailwind,stylex): dialog`).
- Look at both variants side by side in the demo page (light and dark) before calling a component
  done, and check the browser console: `bun run check` doesn't catch runtime errors (a StyleX call
  left uncompiled, `REACTIVITY_HALTED`). Headless browsers only.
- Demos that call `toast()` don't mount a `<Toaster />`: `App.tsx` mounts one per package, like
  shadcn's root layout.
