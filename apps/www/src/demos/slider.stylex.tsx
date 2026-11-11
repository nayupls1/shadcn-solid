import * as stylex from "@stylexjs/stylex"
import { Slider } from "@shadcn-solid/stylex/ui/slider"

export default function SliderDemo() {
  return <Slider defaultValue={[75]} max={100} step={1} xstyle={styles.slider} />
}

const styles = stylex.create({
  slider: { marginInline: "auto", width: "100%", maxWidth: "20rem" },
})
