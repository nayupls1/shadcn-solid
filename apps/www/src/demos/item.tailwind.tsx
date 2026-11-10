import { BadgeCheck, ChevronRight } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Button } from "@shadcn-solid/tailwind/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@shadcn-solid/tailwind/ui/item"

export default function ItemDemo() {
  return (
    <div class="flex w-full max-w-md flex-col gap-6">
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
          <Icon icon={BadgeCheck} class="size-5" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Your profile has been verified.</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Icon icon={ChevronRight} class="size-4" />
        </ItemActions>
      </Item>
    </div>
  )
}
