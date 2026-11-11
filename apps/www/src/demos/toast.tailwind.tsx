import { Button } from "@shadcn-solid/tailwind/ui/button"
import { toast, Toaster } from "@shadcn-solid/tailwind/ui/toast"

export default function ToastDemo() {
  function showToast() {
    const id = toast.add({
      title: "Event created",
      description: "Sunday, December 3 at 9:00 AM",
      actionProps: {
        children: "Undo",
        onClick() {
          toast.close(id)
        },
      },
    })
  }

  return (
    <>
      <Button variant="outline" onClick={showToast}>
        Show Toast
      </Button>
      {/* shadcn mounts <Toaster /> once in the root layout; each demo pane mounts its own. */}
      <Toaster />
    </>
  )
}
