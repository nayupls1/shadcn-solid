import { createContext, createSignal, omit, onSettled, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import * as stylex from "@stylexjs/stylex"
import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType, type EmblaPluginType } from "embla-carousel"
import { ChevronLeft, ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { sxMerge } from "../lib/sx"
import { Button, type ButtonProps } from "./button"

// Port of shadcn/ui's base-vega `carousel` (see the Tailwind variant for the source classes):
// the vanilla `embla-carousel` core in a Solid context with shadcn's API.

type CarouselApi = EmblaCarouselType | undefined
type CarouselOptions = EmblaOptionsType
type CarouselPlugin = EmblaPluginType[]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

/** Getters, so reading `useCarousel().canScrollPrev` in JSX stays reactive. */
type CarouselContextProps = {
  carouselRef: (element: HTMLElement) => void
  readonly api: CarouselApi
  scrollPrev: () => void
  scrollNext: () => void
  readonly canScrollPrev: boolean
  readonly canScrollNext: boolean
  readonly opts: CarouselOptions | undefined
  readonly orientation: "horizontal" | "vertical"
}

const CarouselContext = createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

const styles = stylex.create({
  carousel: { position: "relative" },
  viewport: { overflow: "hidden" },
  content: { display: "flex" },
  contentHorizontal: { marginLeft: "-1rem" },
  contentVertical: { marginTop: "-1rem", flexDirection: "column" },
  item: { minWidth: 0, flexShrink: 0, flexGrow: 0, flexBasis: "100%" },
  itemHorizontal: { paddingLeft: "1rem" },
  itemVertical: { paddingTop: "1rem" },
  button: { position: "absolute", touchAction: "manipulation", borderRadius: "9999px" },
  prevHorizontal: { top: 0, bottom: 0, left: "-3rem", marginBlock: "auto" },
  nextHorizontal: { top: 0, bottom: 0, right: "-3rem", marginBlock: "auto" },
  prevVertical: { top: "-3rem", left: "50%", transform: "translateX(-50%) rotate(90deg)" },
  nextVertical: { bottom: "-3rem", left: "50%", transform: "translateX(-50%) rotate(90deg)" },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  },
})

type XStyle = { class?: string; xstyle?: stylex.StyleXStyles }
type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & XStyle

function Carousel(props: DivProps & CarouselProps) {
  const rest = omit(props, "orientation", "opts", "setApi", "plugins", "class", "style", "children", "ref", "xstyle")
  const [api, setApiSignal] = createSignal<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = createSignal(false)
  const [canScrollNext, setCanScrollNext] = createSignal(false)
  const orientation = () => props.orientation ?? (props.opts?.axis === "y" ? "vertical" : "horizontal")
  let viewport: HTMLElement | undefined

  const onSelect = (embla: EmblaCarouselType) => {
    setCanScrollPrev(embla.canScrollPrev())
    setCanScrollNext(embla.canScrollNext())
  }

  onSettled(() => {
    if (!viewport) return
    const embla = EmblaCarousel(viewport, { ...props.opts, axis: orientation() === "horizontal" ? "x" : "y" }, props.plugins)
    setApiSignal(() => embla)
    props.setApi?.(embla)
    onSelect(embla)
    embla.on("reInit", onSelect)
    embla.on("select", onSelect)

    return () => {
      embla.off("select", onSelect)
      embla.destroy()
    }
  })

  const scrollPrev = () => api()?.scrollPrev()
  const scrollNext = () => api()?.scrollNext()

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollNext()
    }
  }

  const context: CarouselContextProps = {
    carouselRef: (element) => {
      viewport = element
    },
    get api() {
      return api()
    },
    scrollPrev,
    scrollNext,
    get canScrollPrev() {
      return canScrollPrev()
    },
    get canScrollNext() {
      return canScrollNext()
    },
    get opts() {
      return props.opts
    },
    get orientation() {
      return orientation()
    },
  }

  const a = () => sxMerge([styles.carousel, props.xstyle], props.class, props.style)

  return (
    <CarouselContext value={context}>
      <div
        ref={(element: HTMLDivElement) => {
          // React's onKeyDownCapture: listen in the capture phase.
          element.addEventListener("keydown", handleKeyDown, true)
          const ref = props.ref as ((el: HTMLDivElement) => void) | undefined
          if (typeof ref === "function") ref(element)
        }}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...rest}
        class={a().class}
        style={a().style}
      >
        {props.children}
      </div>
    </CarouselContext>
  )
}

function CarouselContent(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const carousel = useCarousel()
  const a = () =>
    sxMerge(
      [
        styles.content,
        carousel.orientation === "horizontal" ? styles.contentHorizontal : styles.contentVertical,
        props.xstyle,
      ],
      props.class,
      props.style,
    )

  return (
    <div ref={carousel.carouselRef} data-slot="carousel-content" {...stylex.attrs(styles.viewport)}>
      <div {...rest} class={a().class} style={a().style} />
    </div>
  )
}

function CarouselItem(props: DivProps) {
  const rest = omit(props, "class", "style", "xstyle")
  const carousel = useCarousel()
  const a = () =>
    sxMerge(
      [styles.item, carousel.orientation === "horizontal" ? styles.itemHorizontal : styles.itemVertical, props.xstyle],
      props.class,
      props.style,
    )

  return <div role="group" aria-roledescription="slide" data-slot="carousel-item" {...rest} class={a().class} style={a().style} />
}

function CarouselPrevious(props: ButtonProps) {
  const rest = omit(props, "variant", "size", "xstyle")
  const carousel = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={props.variant ?? "outline"}
      size={props.size ?? "icon-sm"}
      xstyle={[
        styles.button,
        carousel.orientation === "horizontal" ? styles.prevHorizontal : styles.prevVertical,
        props.xstyle,
      ]}
      disabled={!carousel.canScrollPrev}
      onClick={() => carousel.scrollPrev()}
      {...rest}
    >
      <Icon icon={ChevronLeft} />
      <span {...stylex.attrs(styles.srOnly)}>Previous slide</span>
    </Button>
  )
}

function CarouselNext(props: ButtonProps) {
  const rest = omit(props, "variant", "size", "xstyle")
  const carousel = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={props.variant ?? "outline"}
      size={props.size ?? "icon-sm"}
      xstyle={[
        styles.button,
        carousel.orientation === "horizontal" ? styles.nextHorizontal : styles.nextVertical,
        props.xstyle,
      ]}
      disabled={!carousel.canScrollNext}
      onClick={() => carousel.scrollNext()}
      {...rest}
    >
      <Icon icon={ChevronRight} />
      <span {...stylex.attrs(styles.srOnly)}>Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  type CarouselOptions,
  type CarouselPlugin,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
}
