import { omit, Show } from "solid-js"
import { cn } from "../lib/utils"
import * as ResizablePrimitive from "../lib/resizable-panels"

// shadcn wraps react-resizable-panels; lib/resizable-panels.tsx is a small Solid stand-in with the
// same Group/Panel/Separator shape (orientation, defaultSize/minSize/maxSize, pointer + keyboard).

type ResizablePanelGroupProps = Omit<ResizablePrimitive.GroupProps, "class"> & { class?: string }

function ResizablePanelGroup(props: ResizablePanelGroupProps) {
  const rest = omit(props, "class")
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      class={cn("flex h-full w-full aria-[orientation=vertical]:flex-col", props.class)}
      {...rest}
    />
  )
}

function ResizablePanel(props: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

type ResizableHandleProps = Omit<ResizablePrimitive.SeparatorProps, "class"> & {
  class?: string
  withHandle?: boolean
}

function ResizableHandle(props: ResizableHandleProps) {
  const rest = omit(props, "class", "withHandle")
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      class={cn(
        "relative flex w-px items-center justify-center bg-border ring-offset-background after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
        props.class,
      )}
      {...rest}
    >
      <Show when={props.withHandle}>
        <div class="z-10 flex h-6 w-1 shrink-0 rounded-lg bg-border" />
      </Show>
    </ResizablePrimitive.Separator>
  )
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
