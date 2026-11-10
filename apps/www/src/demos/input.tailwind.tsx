import { Field, FieldDescription, FieldLabel } from "@shadcn-solid/tailwind/ui/field"
import { Input } from "@shadcn-solid/tailwind/ui/input"

export default function InputDemo() {
  return (
    <Field>
      <FieldLabel for="input-demo-api-key">API Key</FieldLabel>
      <Input id="input-demo-api-key" type="password" placeholder="sk-..." />
      <FieldDescription>Your API key is encrypted and stored securely.</FieldDescription>
    </Field>
  )
}
