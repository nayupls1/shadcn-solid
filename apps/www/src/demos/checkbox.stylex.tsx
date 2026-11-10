import * as stylex from "@stylexjs/stylex"
import { Checkbox } from "@shadcn-solid/stylex/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@shadcn-solid/stylex/ui/field"
import { Label } from "@shadcn-solid/stylex/ui/label"

export default function CheckboxDemo() {
  return (
    <FieldGroup xstyle={styles.group}>
      <Field orientation="horizontal">
        <Checkbox id="sx-terms-checkbox" name="terms-checkbox" />
        <Label for="sx-terms-checkbox">Accept terms and conditions</Label>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="sx-terms-checkbox-2" name="terms-checkbox-2" defaultChecked />
        <FieldContent>
          <FieldLabel for="sx-terms-checkbox-2">Accept terms and conditions</FieldLabel>
          <FieldDescription>By clicking this checkbox, you agree to the terms.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal" data-disabled>
        <Checkbox id="sx-toggle-checkbox" name="toggle-checkbox" disabled />
        <FieldLabel for="sx-toggle-checkbox">Enable notifications</FieldLabel>
      </Field>
      <FieldLabel>
        <Field orientation="horizontal">
          <Checkbox id="sx-toggle-checkbox-2" name="toggle-checkbox-2" />
          <FieldContent>
            <FieldTitle>Enable notifications</FieldTitle>
            <FieldDescription>You can enable or disable notifications at any time.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>
    </FieldGroup>
  )
}

const styles = stylex.create({
  group: { maxWidth: "24rem" },
})
