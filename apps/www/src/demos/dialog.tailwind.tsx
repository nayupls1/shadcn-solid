import { Button, type ButtonProps } from "@shadcn-solid/tailwind/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shadcn-solid/tailwind/ui/dialog"

export default function DialogDemo() {
  return (
    <Dialog>
      <form>
        <DialogTrigger render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Open Dialog</DialogTrigger>
        <DialogContent class="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save when you&apos;re done.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
