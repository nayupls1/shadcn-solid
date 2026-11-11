import { Item, ItemContent, ItemMedia, ItemTitle } from "@shadcn-solid/tailwind/ui/item"
import { Spinner } from "@shadcn-solid/tailwind/ui/spinner"

export default function SpinnerDemo() {
  return (
    <div class="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle class="line-clamp-1">Processing payment...</ItemTitle>
        </ItemContent>
        <ItemContent class="flex-none justify-end">
          <span class="text-sm tabular-nums">$100.00</span>
        </ItemContent>
      </Item>
    </div>
  )
}
