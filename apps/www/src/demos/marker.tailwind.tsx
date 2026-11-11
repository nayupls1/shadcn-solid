import { GitBranch, Search } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import { Marker, MarkerContent, MarkerIcon } from "@shadcn-solid/tailwind/ui/marker"
import { Spinner } from "@shadcn-solid/tailwind/ui/spinner"

export default function MarkerDemo() {
  return (
    <div class="flex w-full max-w-sm flex-col gap-8 py-12">
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
        <MarkerContent class="shimmer">Thinking...</MarkerContent>
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
