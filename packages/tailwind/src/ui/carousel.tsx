import { createContext, createSignal, omit, onSettled, useContext } from "solid-js"
import type { JSX } from "@solidjs/web"
import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType, type EmblaPluginType } from "embla-carousel"
import { ChevronLeft, ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { cn } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

// shadcn uses embla-carousel-react; this wires the vanilla `embla-carousel` core into a Solid
// context with the same API (`opts`, `plugins`, `orientation`, `setApi`, `useCarousel()`).

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

type DivProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & { class?: string }

function Carousel(props: DivProps & CarouselProps) {
  const rest = omit(props, "orientation", "opts", "setApi", "plugins", "class", "children", "ref")
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

  return (
    <CarouselContext value={context}>
      <div
        ref={(element: HTMLDivElement) => {
          // React's onKeyDownCapture: listen in the capture phase.
          element.addEventListener("keydown", handleKeyDown, true)
          const ref = props.ref as ((el: HTMLDivElement) => void) | undefined
          if (typeof ref === "function") ref(element)
        }}
        class={cn("relative", props.class)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...rest}
      >
        {props.children}
      </div>
    </CarouselContext>
  )
}

function CarouselContent(props: DivProps) {
  const rest = omit(props, "class")
  const carousel = useCarousel()

  return (
    <div ref={carousel.carouselRef} class="overflow-hidden" data-slot="carousel-content">
      <div class={cn("flex", carousel.orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", props.class)} {...rest} />
    </div>
  )
}

function CarouselItem(props: DivProps) {
  const rest = omit(props, "class")
  const carousel = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      class={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        carousel.orientation === "horizontal" ? "pl-4" : "pt-4",
        props.class,
      )}
      {...rest}
    />
  )
}

function CarouselPrevious(props: ButtonProps) {
  const rest = omit(props, "class", "variant", "size")
  const carousel = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={props.variant ?? "outline"}
      size={props.size ?? "icon-sm"}
      class={cn(
        "absolute touch-manipulation rounded-full",
        carousel.orientation === "horizontal"
          ? "inset-y-0 -left-12 my-auto"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        props.class,
      )}
      disabled={!carousel.canScrollPrev}
      onClick={() => carousel.scrollPrev()}
      {...rest}
    >
      <Icon icon={ChevronLeft} class="cn-rtl-flip" />
      <span class="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext(props: ButtonProps) {
  const rest = omit(props, "class", "variant", "size")
  const carousel = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={props.variant ?? "outline"}
      size={props.size ?? "icon-sm"}
      class={cn(
        "absolute touch-manipulation rounded-full",
        carousel.orientation === "horizontal"
          ? "inset-y-0 -right-12 my-auto"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        props.class,
      )}
      disabled={!carousel.canScrollNext}
      onClick={() => carousel.scrollNext()}
      {...rest}
    >
      <Icon icon={ChevronRight} class="cn-rtl-flip" />
      <span class="sr-only">Next slide</span>
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
