import { Button, type ButtonProps } from "@shadcn-solid/tailwind/ui/button"
import { Input } from "@shadcn-solid/tailwind/ui/input"
import { Label } from "@shadcn-solid/tailwind/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@shadcn-solid/tailwind/ui/sheet"

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Open</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Make changes to your profile here. Click save when you&apos;re done.</SheetDescription>
        </SheetHeader>
        <div class="grid flex-1 auto-rows-min gap-6 px-4">
          <div class="grid gap-3">
            <Label for="sheet-demo-name">Name</Label>
            <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
          </div>
          <div class="grid gap-3">
            <Label for="sheet-demo-username">Username</Label>
            <Input id="sheet-demo-username" defaultValue="@peduarte" />
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
