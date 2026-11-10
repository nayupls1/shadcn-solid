import * as stylex from "@stylexjs/stylex"
import { Skeleton } from "@shadcn-solid/stylex/ui/skeleton"

export default function SkeletonDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <Skeleton xstyle={styles.avatar} />
      <div {...stylex.attrs(styles.lines)}>
        <Skeleton xstyle={[styles.line, styles.w250]} />
        <Skeleton xstyle={[styles.line, styles.w200]} />
      </div>
    </div>
  )
}

const styles = stylex.create({
  root: { display: "flex", alignItems: "center", gap: "1rem" },
  avatar: { width: "3rem", height: "3rem", borderRadius: "9999px" },
  // `space-y-2`
  lines: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  line: { height: "1rem" },
  w250: { width: "250px" },
  w200: { width: "200px" },
})
