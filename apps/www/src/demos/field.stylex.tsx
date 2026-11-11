import { For } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { Button } from "@shadcn-solid/stylex/ui/button"
import { Checkbox } from "@shadcn-solid/stylex/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@shadcn-solid/stylex/ui/field"
import { Input } from "@shadcn-solid/stylex/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@shadcn-solid/stylex/ui/select"
import { Textarea } from "@shadcn-solid/stylex/ui/textarea"

const months = [
  { label: "MM", value: null },
  ...Array.from({ length: 12 }, (_, i) => {
    const value = String(i + 1).padStart(2, "0")
    return { label: value, value }
  }),
]

const years = [
  { label: "YYYY", value: null },
  ...["2024", "2025", "2026", "2027", "2028", "2029"].map((value) => ({ label: value, value })),
]

export default function FieldDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>All transactions are secure and encrypted</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel for="sx-checkout-7j9-card-name-43j">Name on Card</FieldLabel>
                <Input id="sx-checkout-7j9-card-name-43j" placeholder="Evil Rabbit" required />
              </Field>
              <Field>
                <FieldLabel for="sx-checkout-7j9-card-number-uw1">Card Number</FieldLabel>
                <Input id="sx-checkout-7j9-card-number-uw1" placeholder="1234 5678 9012 3456" required />
                <FieldDescription>Enter your 16-digit card number</FieldDescription>
              </Field>
              <div {...stylex.attrs(styles.grid)}>
                <Field>
                  <FieldLabel for="sx-checkout-exp-month-ts6">Month</FieldLabel>
                  <Select items={months}>
                    <SelectTrigger id="sx-checkout-exp-month-ts6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <For each={months}>{(item) => <SelectItem value={item.value}>{item.label}</SelectItem>}</For>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel for="sx-checkout-7j9-exp-year-f59">Year</FieldLabel>
                  <Select items={years}>
                    <SelectTrigger id="sx-checkout-7j9-exp-year-f59">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <For each={years}>{(item) => <SelectItem value={item.value}>{item.label}</SelectItem>}</For>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel for="sx-checkout-7j9-cvv">CVV</FieldLabel>
                  <Input id="sx-checkout-7j9-cvv" placeholder="123" required />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing Address</FieldLegend>
            <FieldDescription>The billing address associated with your payment method</FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
                <Checkbox id="sx-checkout-7j9-same-as-shipping-wgm" defaultChecked />
                <FieldLabel for="sx-checkout-7j9-same-as-shipping-wgm" xstyle={styles.normal}>
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel for="sx-checkout-7j9-optional-comments">Comments</FieldLabel>
                <Textarea
                  id="sx-checkout-7j9-optional-comments"
                  placeholder="Add any additional comments"
                  xstyle={styles.noResize}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

const styles = stylex.create({
  root: { width: "100%", maxWidth: "28rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" },
  normal: { fontWeight: 400 },
  noResize: { resize: "none" },
})
