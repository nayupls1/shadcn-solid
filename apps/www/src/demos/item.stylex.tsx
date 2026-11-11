import * as stylex from "@stylexjs/stylex"
import { BadgeCheck, ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Button } from "@shadcn-solid/stylex/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@shadcn-solid/stylex/ui/item"

export default function ItemDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Basic Item</ItemTitle>
          <ItemDescription>A simple item with title and description.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm">
            Action
          </Button>
        </ItemActions>
      </Item>
      <Item variant="outline" size="sm" render={<a href="#" />}>
        <ItemMedia>
          <Icon icon={BadgeCheck} size={20} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Your profile has been verified.</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Icon icon={ChevronRight} size={16} />
        </ItemActions>
      </Item>
    </div>
  )
}

const styles = stylex.create({
  root: { display: "flex", width: "100%", maxWidth: "28rem", flexDirection: "column", gap: "1.5rem" },
})
