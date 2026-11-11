import { Search } from "lucide"
import * as stylex from "@stylexjs/stylex"
import { Icon } from "@shadcn-solid/icons"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@shadcn-solid/stylex/ui/input-group"

export default function InputGroupDemo() {
  return (
    <InputGroup xstyle={styles.group}>
      <InputGroupInput placeholder="Search..." />
      <InputGroupAddon>
        <Icon icon={Search} />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
    </InputGroup>
  )
}

const styles = stylex.create({
  group: { maxWidth: "20rem" },
})
