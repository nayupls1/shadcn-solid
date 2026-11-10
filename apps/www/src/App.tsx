import { createEffect, createMemo, createSignal, For, Show, type Component } from "solid-js"
import { Dynamic } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import { Moon, Sun } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Button } from "@shadcn-solid/tailwind/ui/button"
import { darkMode } from "@shadcn-solid/stylex/lib/theme"
import { demos, type DemoEntry } from "./registry"

const darkModeClass = stylex.attrs(darkMode).class ?? ""

function readHash() {
  return decodeURIComponent(window.location.hash.replace(/^#\/?/, ""))
}

export function App() {
  const [hash, setHash] = createSignal(readHash())
  window.addEventListener("hashchange", () => setHash(readHash()))

  const [dark, setDark] = createSignal(window.matchMedia("(prefers-color-scheme: dark)").matches)
  createEffect(dark, (isDark) => {
    const root = document.documentElement
    root.classList.toggle("dark", isDark)
    for (const cls of darkModeClass.split(" ").filter(Boolean)) root.classList.toggle(cls, isDark)
    root.style.colorScheme = isDark ? "dark" : "light"
  })

  const selected = createMemo(() => demos.find((d) => d.name === hash()))

  return (
    <div class="flex min-h-svh">
      <aside class="sticky top-0 hidden h-svh w-56 shrink-0 overflow-y-auto border-r p-4 md:block">
        <a href="#" class="mb-4 block text-sm font-semibold">
          shadcn-solid
        </a>
        <p class="mb-2 text-xs font-medium text-muted-foreground">Components ({demos.length})</p>
        <nav class="flex flex-col gap-0.5">
          <For each={demos}>
            {(demo) => (
              <a
                href={`#${demo.name}`}
                class="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                aria-current={hash() === demo.name ? "page" : undefined}
              >
                {demo.title}
              </a>
            )}
          </For>
        </nav>
      </aside>
      <main class="min-w-0 flex-1">
        <header class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b bg-background/80 px-6 py-3 backdrop-blur">
          <div class="min-w-0">
            <h1 class="truncate text-base font-semibold">{selected()?.title ?? "All components"}</h1>
            <p class="text-xs text-muted-foreground">
              shadcn/ui for Solid 2.0 on base-ui-solidjs, in Tailwind and StyleX.
            </p>
          </div>
          <Button variant="outline" size="icon" aria-label="Toggle dark mode" onClick={() => setDark((d) => !d)}>
            <Icon icon={dark() ? Sun : Moon} />
          </Button>
        </header>
        <div class="flex flex-col gap-10 p-6">
          <Show when={selected()} fallback={<For each={demos}>{(demo) => <DemoSection demo={demo} />}</For>}>
            {(demo) => <DemoSection demo={demo()} />}
          </Show>
        </div>
      </main>
    </div>
  )
}

function DemoSection(props: { demo: DemoEntry }) {
  return (
    <section id={`section-${props.demo.name}`} class="flex flex-col gap-3">
      <h2 class="text-sm font-semibold">
        <a href={`#${props.demo.name}`} class="hover:underline">
          {props.demo.title}
        </a>
      </h2>
      <div class="grid gap-4 lg:grid-cols-2">
        <DemoPane label="Tailwind" component={props.demo.tailwind} />
        <DemoPane label="StyleX" component={props.demo.stylex} />
      </div>
    </section>
  )
}

function DemoPane(props: { label: string; component?: Component }) {
  return (
    <div class="flex min-w-0 flex-col overflow-hidden rounded-xl border">
      <div class="border-b px-3 py-1.5 text-xs font-medium text-muted-foreground">{props.label}</div>
      <div class="flex min-h-40 flex-1 items-center justify-center p-6">
        <Show when={props.component} fallback={<span class="text-sm text-muted-foreground">Not implemented</span>}>
          {(component) => <Dynamic component={component()} />}
        </Show>
      </div>
    </div>
  )
}
