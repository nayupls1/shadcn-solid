import { createSignal, For, Show } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { useIsMobile } from "@shadcn-solid/stylex/hooks/use-mobile"
import { Badge } from "@shadcn-solid/stylex/ui/badge"
import { Button, type ButtonProps } from "@shadcn-solid/stylex/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@shadcn-solid/stylex/ui/drawer"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@shadcn-solid/stylex/ui/field"
import { RadioGroup, RadioGroupItem } from "@shadcn-solid/stylex/ui/radio-group"
import { Toaster, toast } from "@shadcn-solid/stylex/ui/sonner"

const deliveryTimes = [
  {
    value: "asap",
    id: "delivery-asap",
    label: "Standard delivery",
    description: "25–35 min · Driver assigned now",
    badge: "Fastest",
  },
  {
    value: "5-00",
    id: "delivery-5-00",
    label: "5:00 PM – 5:15 PM",
    description: "Prep starts at 4:45 PM",
  },
  {
    value: "5-30",
    id: "delivery-5-30",
    label: "5:30 PM – 5:45 PM",
    description: "Good if you're heading home",
  },
  {
    value: "6-00",
    id: "delivery-6-00",
    label: "6:00 PM – 6:15 PM",
    description: "Most popular · High demand",
  },
  {
    value: "6-30",
    id: "delivery-6-30",
    label: "6:30 PM – 6:45 PM",
    description: "Last slot before kitchen closes",
  },
]

export default function DrawerDemo() {
  const [open, setOpen] = createSignal(false)
  const [deliveryTime, setDeliveryTime] = createSignal("asap")
  const isMobile = useIsMobile()

  function handleConfirm() {
    const selected = deliveryTimes.find((time) => time.value === deliveryTime())

    if (!selected) {
      return
    }

    setOpen(false)
    toast("Delivery time confirmed", {
      description: selected.label,
    })
  }

  return (
    <>
      <Drawer
        open={open()}
        onOpenChange={(value) => setOpen(value)}
        showSwipeHandle={isMobile()}
        swipeDirection={isMobile() ? "down" : "right"}
      >
        <DrawerTrigger render={(p) => <Button {...(p as ButtonProps)} variant="secondary" />}>Open Drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Pick a delivery time</DrawerTitle>
            <DrawerDescription>We&apos;ll prepare your order as soon as possible.</DrawerDescription>
          </DrawerHeader>
          <div {...stylex.attrs(styles.body)}>
            <RadioGroup value={deliveryTime()} onValueChange={(value) => setDeliveryTime(value as string)} xstyle={styles.radioGroup}>
              <For each={deliveryTimes}>
                {(time) => (
                  <FieldLabel for={time.id}>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle xstyle={styles.title}>
                          {time.label}
                          <Show when={time.badge}>
                            <Badge variant="secondary">{time.badge}</Badge>
                          </Show>
                        </FieldTitle>
                        <FieldDescription>{time.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value={time.value} id={time.id} />
                    </Field>
                  </FieldLabel>
                )}
              </For>
            </RadioGroup>
          </div>
          <DrawerFooter>
            <Button onClick={handleConfirm} xstyle={styles.confirm}>
              Confirm Delivery Time
            </Button>
            <DrawerClose render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Cancel</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {/* shadcn mounts <Toaster /> once in the app layout; the demo renders it itself. */}
      <Toaster />
    </>
  )
}

const styles = stylex.create({
  // shadcn's `scroll-fade` (a scroll-driven edge mask utility) has no StyleX port here; it only shows
  // when the list overflows.
  body: { flex: "1 1 0%", overflowY: "auto", padding: "1rem" },
  radioGroup: { gap: "0.5rem" },
  title: { display: "flex", alignItems: "center", gap: "0.5rem" },
  confirm: { height: "34px" },
})
