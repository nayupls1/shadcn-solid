import { createSignal, onSettled } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Progress } from "@shadcn-solid/stylex/ui/progress"

export default function ProgressDemo() {
  const [progress, setProgress] = createSignal(13)

  onSettled(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  })

  return <Progress value={progress()} xstyle={styles.root} />
}

const styles = stylex.create({
  root: { width: "60%" },
})
