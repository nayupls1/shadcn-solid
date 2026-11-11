import { createSignal } from "solid-js"
import { addDays } from "date-fns"
import { Calendar, type DateRange } from "@shadcn-solid/tailwind/ui/calendar"

// shadcn's main calendar demo (single, dropdown caption), plus its range and multiple examples
// (the multiple example sits in a Card upstream; a bordered calendar stands in for it here).
export default function CalendarDemo() {
  const [date, setDate] = createSignal<Date | undefined>(new Date())
  const [dateRange, setDateRange] = createSignal<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
  })

  return (
    <div class="flex flex-col items-center gap-6">
      <Calendar
        mode="single"
        selected={date()}
        onSelect={setDate}
        class="rounded-lg border"
        captionLayout="dropdown"
      />
      <Calendar
        mode="range"
        defaultMonth={dateRange()?.from}
        selected={dateRange()}
        onSelect={setDateRange}
        numberOfMonths={2}
        class="rounded-lg border"
      />
      <Calendar mode="multiple" class="rounded-lg border" />
    </div>
  )
}
