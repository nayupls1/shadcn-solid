import * as stylex from "@stylexjs/stylex"
import { CircleCheck, Info } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Alert, AlertDescription, AlertTitle, alertIconStyles } from "@shadcn-solid/stylex/ui/alert"

export default function AlertDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <Alert>
        <Icon icon={CircleCheck} {...stylex.attrs(alertIconStyles)} />
        <AlertTitle>Payment successful</AlertTitle>
        <AlertDescription>
          Your payment of $29.99 has been processed. A receipt has been sent to your email address.
        </AlertDescription>
      </Alert>
      <Alert>
        <Icon icon={Info} {...stylex.attrs(alertIconStyles)} />
        <AlertTitle>New feature available</AlertTitle>
        <AlertDescription>
          We've added dark mode support. You can enable it in your account settings.
        </AlertDescription>
      </Alert>
    </div>
  )
}

const styles = stylex.create({
  root: { display: "grid", width: "100%", maxWidth: "28rem", alignItems: "start", gap: "1rem" },
})
