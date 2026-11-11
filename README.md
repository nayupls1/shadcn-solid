# shadcn-solid

[shadcn/ui](https://ui.shadcn.com) for **Solid 2.0**, built on
[`base-ui-solidjs`](https://www.npmjs.com/package/base-ui-solidjs). It's a 1:1 port of shadcn's
Base UI flavour (style `base-vega`): the same parts, exports, `data-slot`s, variants and sizes,
in two styling variants that look and behave the same:

- **tailwind**: Tailwind CSS v4, with the same class strings as shadcn's components.
- **stylex**: the same components styled with [StyleX](https://stylexjs.com).

Like shadcn/ui, it isn't a dependency you install: the `shadcn-solid` CLI copies the components'
source into your project, where you own and edit it, and adds the npm packages they use.

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

## Adding components to your project

Download the CLI for your platform from the
[latest release](https://github.com/nayupls1/shadcn-solid/releases/latest)
(`shadcn-solid-linux-x64`, `shadcn-solid-linux-arm64` or `shadcn-solid-windows-x64.exe`). It's
a single executable with every component built in, so it needs neither Node nor network access to
copy files. Then, in a Solid 2.0 project:

```sh
shadcn-solid init                      # asks for tailwind or stylex (or pass --style)
shadcn-solid add button dialog         # copies the components and everything they import
shadcn-solid add --all
shadcn-solid list                      # available components; ● marks installed ones
```

`init` writes `components.json`, the shared files (`lib/utils.ts`, the `Icon` component and, for
StyleX, `lib/tokens.stylex.ts` and `lib/theme.ts`) and, for Tailwind, merges shadcn's theme into
your CSS file and puts `shadcn.css` next to it. `add` copies each component with the components,
hooks and helpers it uses, and installs missing npm packages with your package manager (detected
from the lockfile; `--no-install` prints the command instead). Existing files that differ are left
alone unless you confirm or pass `--overwrite`. `-y` skips every prompt.

```json
{
  "style": "tailwind",
  "tailwind": { "css": "src/index.css" },
  "aliases": { "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }
}
```

`aliases` decide where files go. They are resolved through your tsconfig `paths` (`init` uses
`@/…` when `@/*` is configured), or can be plain paths such as `src/components/ui`. The copied
files import each other with relative paths, so neither your bundler nor StyleX needs to know
the alias.

```tsx
import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { Plus } from "lucide"

<Button variant="outline"><Icon icon={Plus} /> Add</Button>
```

- **Tailwind**: Tailwind CSS v4 must run in your build (`@tailwindcss/vite`). Dark mode: add the
  `dark` class to `<html>`.
- **StyleX**: compile StyleX in your build (`@stylexjs/unplugin`, see `apps/www/vite.config.ts`).
  Dark mode: put `stylex.attrs(darkMode)` on the root in dark mode and `stylex.attrs(lightMode)`
  otherwise (both from `lib/theme`; StyleX's `light-dark()` fallback needs one of them on an
  ancestor). Like shadcn's, the components assume a CSS reset such as Tailwind's Preflight.
  Every StyleX component also takes an `xstyle` prop: StyleX styles merged last.

The CLI lives in `packages/cli`. `bun run cli -- <command> --cwd /abs/path/to/project` runs it
from source, `bun run cli:build` compiles it to `packages/cli/dist`. Pushing a `v*` tag runs
`.github/workflows/release.yml`, which builds the executables, smoke-tests each on its OS and
publishes them as a GitHub release.

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
