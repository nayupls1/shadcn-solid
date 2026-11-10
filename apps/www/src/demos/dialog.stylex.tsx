import * as stylex from "@stylexjs/stylex"
import { Button, type ButtonProps } from "@shadcn-solid/stylex/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shadcn-solid/stylex/ui/dialog"

export default function DialogDemo() {
  return (
    <Dialog>
      <form>
        <DialogTrigger render={(p) => <Button {...(p as ButtonProps)} variant="outline" />}>Open Dialog</DialogTrigger>
        <DialogContent xstyle={styles.content}>
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

const styles = stylex.create({
  content: { maxWidth: { default: "calc(100% - 2rem)", "@media (min-width: 40rem)": "24rem" } },
})
