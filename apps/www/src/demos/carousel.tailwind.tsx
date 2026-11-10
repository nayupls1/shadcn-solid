import { For } from "solid-js"
import { Card, CardContent } from "@shadcn-solid/tailwind/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@shadcn-solid/tailwind/ui/carousel"

export default function CarouselDemo() {
  return (
    <Carousel class="w-full max-w-[12rem] sm:max-w-xs">
      <CarouselContent>
        <For each={Array.from({ length: 5 }, (_, index) => index)}>
          {(index) => (
            <CarouselItem>
              <div class="p-1">
                <Card>
                  <CardContent class="flex aspect-square items-center justify-center p-6">
                    <span class="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          )}
        </For>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
