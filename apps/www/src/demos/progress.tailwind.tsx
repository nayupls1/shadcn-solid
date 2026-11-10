import { createSignal, onSettled } from "solid-js"
import { Progress } from "@shadcn-solid/tailwind/ui/progress"

export default function ProgressDemo() {
  const [progress, setProgress] = createSignal(13)

  onSettled(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  })

  return <Progress value={progress()} class="w-[60%]" />
}
