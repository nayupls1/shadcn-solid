import { CircleCheck, Info } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Alert, AlertDescription, AlertTitle } from "@shadcn-solid/tailwind/ui/alert"

export default function AlertDemo() {
  return (
    <div class="grid w-full max-w-md items-start gap-4">
      <Alert>
        <Icon icon={CircleCheck} />
        <AlertTitle>Payment successful</AlertTitle>
        <AlertDescription>
          Your payment of $29.99 has been processed. A receipt has been sent to your email address.
        </AlertDescription>
      </Alert>
      <Alert>
        <Icon icon={Info} />
        <AlertTitle>New feature available</AlertTitle>
        <AlertDescription>
          We've added dark mode support. You can enable it in your account settings.
        </AlertDescription>
      </Alert>
    </div>
  )
}
