import { For } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Card, CardContent } from "@shadcn-solid/stylex/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@shadcn-solid/stylex/ui/carousel"

export default function CarouselDemo() {
  return (
    <Carousel xstyle={styles.carousel}>
      <CarouselContent>
        <For each={Array.from({ length: 5 }, (_, index) => index)}>
          {(index) => (
            <CarouselItem>
              <div {...stylex.attrs(styles.pad)}>
                <Card>
                  <CardContent xstyle={styles.content}>
                    <span {...stylex.attrs(styles.number)}>{index + 1}</span>
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

const styles = stylex.create({
  carousel: { width: "100%", maxWidth: { default: "12rem", "@media (min-width: 40rem)": "20rem" } },
  pad: { padding: "0.25rem" },
  content: {
    display: "flex",
    aspectRatio: "1 / 1",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
  },
  number: { fontSize: "2.25rem", lineHeight: "2.5rem", fontWeight: 600 },
})
