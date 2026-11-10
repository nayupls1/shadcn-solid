import * as stylex from "@stylexjs/stylex"
import { Button } from "@shadcn-solid/stylex/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shadcn-solid/stylex/ui/card"
import { Input } from "@shadcn-solid/stylex/ui/input"
import { Label } from "@shadcn-solid/stylex/ui/label"

export default function CardDemo() {
  return (
    <Card xstyle={styles.card}>
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div {...stylex.attrs(styles.fields)}>
            <div {...stylex.attrs(styles.field)}>
              <Label for="email-sx">Email</Label>
              <Input id="email-sx" type="email" placeholder="m@example.com" required />
            </div>
            <div {...stylex.attrs(styles.field)}>
              <div {...stylex.attrs(styles.labelRow)}>
                <Label for="password-sx">Password</Label>
                <a href="#" {...stylex.attrs(styles.forgot)}>
                  Forgot your password?
                </a>
              </div>
              <Input id="password-sx" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter xstyle={styles.footer}>
        <Button type="submit" xstyle={styles.fullWidth}>
          Login
        </Button>
        <Button variant="outline" xstyle={styles.fullWidth}>
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  )
}

const styles = stylex.create({
  card: { width: "100%", maxWidth: "24rem" },
  fields: { display: "flex", flexDirection: "column", gap: "1.5rem" },
  field: { display: "grid", gap: "0.5rem" },
  labelRow: { display: "flex", alignItems: "center" },
  forgot: {
    marginLeft: "auto",
    display: "inline-block",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    textUnderlineOffset: "4px",
    textDecorationLine: { default: null, ":hover": "underline" },
  },
  footer: { flexDirection: "column", gap: "0.5rem" },
  fullWidth: { width: "100%" },
})
