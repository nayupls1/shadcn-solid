import { For } from "solid-js"
import { Button } from "@shadcn-solid/tailwind/ui/button"
import { Checkbox } from "@shadcn-solid/tailwind/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@shadcn-solid/tailwind/ui/field"
import { Input } from "@shadcn-solid/tailwind/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@shadcn-solid/tailwind/ui/select"
import { Textarea } from "@shadcn-solid/tailwind/ui/textarea"

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
    <div class="w-full max-w-md">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Payment Method</FieldLegend>
            <FieldDescription>All transactions are secure and encrypted</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel for="checkout-7j9-card-name-43j">Name on Card</FieldLabel>
                <Input id="checkout-7j9-card-name-43j" placeholder="Evil Rabbit" required />
              </Field>
              <Field>
                <FieldLabel for="checkout-7j9-card-number-uw1">Card Number</FieldLabel>
                <Input id="checkout-7j9-card-number-uw1" placeholder="1234 5678 9012 3456" required />
                <FieldDescription>Enter your 16-digit card number</FieldDescription>
              </Field>
              <div class="grid grid-cols-3 gap-4">
                <Field>
                  <FieldLabel for="checkout-exp-month-ts6">Month</FieldLabel>
                  <Select items={months}>
                    <SelectTrigger id="checkout-exp-month-ts6">
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
                  <FieldLabel for="checkout-7j9-exp-year-f59">Year</FieldLabel>
                  <Select items={years}>
                    <SelectTrigger id="checkout-7j9-exp-year-f59">
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
                  <FieldLabel for="checkout-7j9-cvv">CVV</FieldLabel>
                  <Input id="checkout-7j9-cvv" placeholder="123" required />
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
                <Checkbox id="checkout-7j9-same-as-shipping-wgm" defaultChecked />
                <FieldLabel for="checkout-7j9-same-as-shipping-wgm" class="font-normal">
                  Same as shipping address
                </FieldLabel>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel for="checkout-7j9-optional-comments">Comments</FieldLabel>
                <Textarea id="checkout-7j9-optional-comments" placeholder="Add any additional comments" class="resize-none" />
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
