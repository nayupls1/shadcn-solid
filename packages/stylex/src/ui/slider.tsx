import { For, omit } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Slider as SliderPrimitive } from "base-ui-solidjs/slider"
import { colors } from "../tokens.stylex"
import { cx } from "../lib/utils"
import { mergeStyle } from "../lib/style"

// Port of shadcn/ui's base-vega `slider` (see the Tailwind variant for the source classes).
// `data-horizontal:` / `data-vertical:` become `[data-orientation=…]` conditions on each part.
const horizontal = ":is([data-orientation=horizontal])"
const vertical = ":is([data-orientation=vertical])"
const shadowSm = "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
const thumbRing = `0 0 0 4px color-mix(in oklch, ${colors.ring} 50%, transparent), ${shadowSm}`

const styles = stylex.create({
  root: {
    width: { default: null, [horizontal]: "100%" },
    height: { default: null, [vertical]: "100%" },
  },
  control: {
    position: "relative",
    display: "flex",
    width: { default: "100%", [vertical]: "auto" },
    height: { default: null, [vertical]: "100%" },
    minHeight: { default: null, [vertical]: "10rem" },
    flexDirection: { default: null, [vertical]: "column" },
    touchAction: "none",
    alignItems: "center",
    userSelect: "none",
    opacity: { default: null, ":is([data-disabled])": 0.5 },
  },
  track: {
    position: "relative",
    flexGrow: 1,
    overflow: "hidden",
    borderRadius: "9999px",
    backgroundColor: colors.muted,
    userSelect: "none",
    height: { default: null, [horizontal]: "0.375rem", [vertical]: "100%" },
    width: { default: null, [horizontal]: "100%", [vertical]: "0.375rem" },
  },
  indicator: {
    backgroundColor: colors.primary,
    userSelect: "none",
    height: { default: null, [horizontal]: "100%" },
    width: { default: null, [vertical]: "100%" },
  },
  thumb: {
    display: "block",
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    borderRadius: "9999px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.primary,
    backgroundColor: "#fff",
    boxShadow: {
      default: shadowSm,
      ":hover": thumbRing,
      ":focus-visible": thumbRing,
    },
    transitionProperty: "color, box-shadow",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    userSelect: "none",
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineWidth: { default: null, ":focus-visible": "2px" },
    outlineColor: { default: null, ":focus-visible": "transparent" },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    pointerEvents: { default: null, ":disabled": "none" },
    opacity: { default: null, ":disabled": 0.5 },
  },
})

type SliderProps = Omit<SliderPrimitive.Root.Props, "class"> & {
  class?: string
  /** StyleX overrides, merged last. */
  xstyle?: stylex.StyleXStyles
}

function Slider(props: SliderProps) {
  const rest = omit(props, "class", "style", "defaultValue", "value", "min", "max", "xstyle")
  const values = () =>
    Array.isArray(props.value)
      ? props.value
      : Array.isArray(props.defaultValue)
        ? props.defaultValue
        : [props.min ?? 0, props.max ?? 100]
  const attrs = () => stylex.attrs(styles.root, props.xstyle)

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={props.defaultValue}
      value={props.value}
      min={props.min ?? 0}
      max={props.max ?? 100}
      thumbAlignment="edge"
      {...rest}
      class={cx(attrs().class, props.class)}
      style={mergeStyle(attrs().style, props.style)}
    >
      <SliderPrimitive.Control {...stylex.attrs(styles.control)}>
        <SliderPrimitive.Track data-slot="slider-track" {...stylex.attrs(styles.track)}>
          <SliderPrimitive.Indicator data-slot="slider-range" {...stylex.attrs(styles.indicator)} />
        </SliderPrimitive.Track>
        <For each={Array.from({ length: values().length }, (_, i) => i)}>
          {(index) => <SliderPrimitive.Thumb data-slot="slider-thumb" index={index} {...stylex.attrs(styles.thumb)} />}
        </For>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider, type SliderProps }
