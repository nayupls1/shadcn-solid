import * as stylex from "@stylexjs/stylex"
import { ArrowUpRight, FolderCode } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Button } from "@shadcn-solid/stylex/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@shadcn-solid/stylex/ui/empty"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"

export default function EmptyDemo() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon={FolderCode} size={24} />
        </EmptyMedia>
        <EmptyTitle>No Projects Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any projects yet. Get started by creating your first project.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent xstyle={styles.actions}>
        <Button>Create Project</Button>
        <Button variant="outline">Import Project</Button>
      </EmptyContent>
      <Button variant="link" render={<a href="#" />} xstyle={styles.learnMore} size="sm" nativeButton={false}>
        Learn More <Icon icon={ArrowUpRight} />
      </Button>
    </Empty>
  )
}

const styles = stylex.create({
  actions: { flexDirection: "row", justifyContent: "center", gap: "0.5rem" },
  learnMore: { color: colors.mutedForeground },
})
