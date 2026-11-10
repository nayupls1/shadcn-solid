import { createSignal } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { addDays } from "date-fns"
import { Calendar, type DateRange } from "@shadcn-solid/stylex/ui/calendar"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"

// shadcn's main calendar demo (single, dropdown caption), plus its range and multiple examples
// (the multiple example sits in a Card upstream; a bordered calendar stands in for it here).
export default function CalendarDemo() {
  const [date, setDate] = createSignal<Date | undefined>(new Date())
  const [dateRange, setDateRange] = createSignal<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 12),
    to: addDays(new Date(new Date().getFullYear(), 0, 12), 30),
  })

  return (
    <div {...stylex.attrs(styles.column)}>
      <Calendar mode="single" selected={date()} onSelect={setDate} xstyle={styles.bordered} captionLayout="dropdown" />
      <Calendar
        mode="range"
        defaultMonth={dateRange()?.from}
        selected={dateRange()}
        onSelect={setDateRange}
        numberOfMonths={2}
        xstyle={styles.bordered}
      />
      <Calendar mode="multiple" xstyle={styles.bordered} />
    </div>
  )
}

const styles = stylex.create({
  column: { display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" },
  // `rounded-lg border`
  bordered: { borderRadius: radius.lg, borderWidth: 1, borderStyle: "solid", borderColor: colors.border },
})
