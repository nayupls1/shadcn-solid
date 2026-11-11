import * as stylex from "@stylexjs/stylex"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@shadcn-solid/stylex/ui/resizable"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"

export default function ResizableDemo() {
  return (
    <ResizablePanelGroup orientation="horizontal" xstyle={styles.group}>
      <ResizablePanel defaultSize="50%">
        <div {...stylex.attrs(styles.cell, styles.tall)}>
          <span {...stylex.attrs(styles.label)}>One</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="50%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="25%">
            <div {...stylex.attrs(styles.cell, styles.full)}>
              <span {...stylex.attrs(styles.label)}>Two</span>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="75%">
            <div {...stylex.attrs(styles.cell, styles.full)}>
              <span {...stylex.attrs(styles.label)}>Three</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

const styles = stylex.create({
  group: {
    maxWidth: "24rem",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: colors.border,
  },
  cell: { display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" },
  tall: { height: "200px" },
  full: { height: "100%" },
  label: { fontWeight: 600 },
})
