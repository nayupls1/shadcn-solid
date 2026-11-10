import { For } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@shadcn-solid/stylex/ui/select"

const items = [
  { label: "Select a fruit", value: null },
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
  { label: "Grapes", value: "grapes" },
  { label: "Pineapple", value: "pineapple" },
]

export default function SelectDemo() {
  return (
    <Select items={items}>
      <SelectTrigger xstyle={styles.trigger}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <For each={items}>{(item) => <SelectItem value={item.value}>{item.label}</SelectItem>}</For>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const styles = stylex.create({
  trigger: { width: "100%", maxWidth: "12rem" },
})
