import { For, omit } from "solid-js"
import { Slider as SliderPrimitive } from "base-ui-solidjs/slider"
import { cn } from "../lib/utils"

type SliderProps = Omit<SliderPrimitive.Root.Props, "class"> & { class?: string }

function Slider(props: SliderProps) {
  const rest = omit(props, "class", "defaultValue", "value", "min", "max")
  const values = () =>
    Array.isArray(props.value)
      ? props.value
      : Array.isArray(props.defaultValue)
        ? props.defaultValue
        : [props.min ?? 0, props.max ?? 100]

  return (
    <SliderPrimitive.Root
      class={cn("data-horizontal:w-full data-vertical:h-full", props.class)}
      data-slot="slider"
      defaultValue={props.defaultValue}
      value={props.value}
      min={props.min ?? 0}
      max={props.max ?? 100}
      thumbAlignment="edge"
      {...rest}
    >
      <SliderPrimitive.Control class="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          class="relative grow overflow-hidden rounded-full bg-muted select-none data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            class="bg-primary select-none data-horizontal:h-full data-vertical:w-full"
          />
        </SliderPrimitive.Track>
        <For each={Array.from({ length: values().length }, (_, i) => i)}>
          {(index) => (
            <SliderPrimitive.Thumb
              data-slot="slider-thumb"
              index={index}
              class="block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
            />
          )}
        </For>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider, type SliderProps }
