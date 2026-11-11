import * as stylex from "@stylexjs/stylex"
import { GitBranch, Search } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Marker, MarkerContent, MarkerIcon } from "@shadcn-solid/stylex/ui/marker"
import { Spinner } from "@shadcn-solid/stylex/ui/spinner"
import { shimmerStyles } from "@shadcn-solid/stylex/lib/shimmer"

export default function MarkerDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <Marker>
        <MarkerIcon>
          <Icon icon={GitBranch} />
        </MarkerIcon>
        <MarkerContent>Switched to a new branch</MarkerContent>
      </Marker>
      <Marker role="status">
        <MarkerIcon>
          <Spinner />
        </MarkerIcon>
        <MarkerContent xstyle={shimmerStyles.shimmer}>Thinking...</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Conversation compacted</MarkerContent>
      </Marker>
      <Marker>
        <MarkerIcon>
          <Icon icon={Search} />
        </MarkerIcon>
        <MarkerContent>Explored 4 files</MarkerContent>
      </Marker>
    </div>
  )
}

const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    maxWidth: "24rem",
    flexDirection: "column",
    gap: "2rem",
    paddingBlock: "3rem",
  },
})
