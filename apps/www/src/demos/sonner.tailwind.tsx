import { Button } from "@shadcn-solid/tailwind/ui/button"
import { Toaster, toast } from "@shadcn-solid/tailwind/ui/sonner"

// shadcn's sonner demo (the base docs moved sonner to `toast`; this is its radix-nova demo).
// shadcn mounts <Toaster /> once in the app layout; the demo renders it itself.
export default function SonnerDemo() {
  return (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03, 2023 at 9:00 AM",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        }
      >
        Show Toast
      </Button>
      <Toaster />
    </>
  )
}
