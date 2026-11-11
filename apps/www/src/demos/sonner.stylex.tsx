import { Button } from "@shadcn-solid/stylex/ui/button"
import { toast } from "@shadcn-solid/stylex/ui/sonner"

// shadcn's sonner demo (the base docs moved sonner to `toast`; this is its radix-nova demo).
// Like shadcn's layout, App.tsx mounts <Toaster /> once.
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
    </>
  )
}
