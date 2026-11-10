import * as stylex from "@stylexjs/stylex"
import { Button, type ButtonProps } from "@shadcn-solid/stylex/ui/button"
import { Input } from "@shadcn-solid/stylex/ui/input"
import { Label } from "@shadcn-solid/stylex/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shadcn-solid/stylex/ui/sheet"

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Open</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile here. Click save when you&apos;re done.</SheetDescription>
        </SheetHeader>
        <div {...stylex.attrs(styles.fields)}>
          <div {...stylex.attrs(styles.field)}>
            <Label for="sheet-demo-name-sx">Name</Label>
            <Input id="sheet-demo-name-sx" defaultValue="Pedro Duarte" />
          </div>
          <div {...stylex.attrs(styles.field)}>
            <Label for="sheet-demo-username-sx">Username</Label>
            <Input id="sheet-demo-username-sx" defaultValue="@peduarte" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Close</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

const styles = stylex.create({
  // grid flex-1 auto-rows-min gap-6 px-4
  fields: { display: "grid", flex: "1 1 0%", gridAutoRows: "min-content", gap: "1.5rem", paddingInline: "1rem" },
  // grid gap-3
  field: { display: "grid", gap: "0.75rem" },
})
