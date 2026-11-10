import { Field, FieldDescription, FieldLabel } from "@shadcn-solid/stylex/ui/field"
import { Input } from "@shadcn-solid/stylex/ui/input"

export default function InputDemo() {
  return (
    <Field>
      <FieldLabel for="sx-input-demo-api-key">API Key</FieldLabel>
      <Input id="sx-input-demo-api-key" type="password" placeholder="sk-..." />
      <FieldDescription>Your API key is encrypted and stored securely.</FieldDescription>
    </Field>
  )
}
