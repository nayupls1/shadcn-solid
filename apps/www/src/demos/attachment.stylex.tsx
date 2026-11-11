import { For } from "solid-js"
import * as stylex from "@stylexjs/stylex"
import { FileCode, X } from "lucide"
import { Icon } from "@shadcn-solid/icons"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@shadcn-solid/stylex/ui/attachment"
import { Spinner } from "@shadcn-solid/stylex/ui/spinner"

const images = [
  {
    name: "workspace.png",
    meta: "PNG · 820 KB",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&auto=format&fit=crop&q=80",
    alt: "Workspace",
  },
  {
    name: "desk-reference.jpg",
    meta: "JPG · 1.1 MB",
    src: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=900&auto=format&fit=crop&q=80",
    alt: "Desk",
  },
  {
    name: "office-reference.jpg",
    meta: "JPG · 940 KB",
    src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&auto=format&fit=crop&q=80",
    alt: "Office",
  },
]

export default function AttachmentDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <AttachmentGroup>
        <For each={images}>
          {(image) => (
            <Attachment orientation="vertical">
              <AttachmentMedia variant="image">
                <img src={image.src} alt={image.alt} {...stylex.attrs(styles.image)} />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{image.name}</AttachmentTitle>
                <AttachmentDescription>{image.meta}</AttachmentDescription>
              </AttachmentContent>
            </Attachment>
          )}
        </For>
      </AttachmentGroup>
      <Attachment state="uploading" xstyle={styles.full}>
        <AttachmentMedia>
          <Spinner />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>sales-dashboard.pdf</AttachmentTitle>
          <AttachmentDescription>Uploading · 64%</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Cancel upload">
            <Icon icon={X} size={12} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
      <Attachment xstyle={styles.full}>
        <AttachmentMedia>
          <Icon icon={FileCode} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>message-renderer.tsx</AttachmentTitle>
          <AttachmentDescription>TypeScript · 12 KB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentAction aria-label="Remove message-renderer.tsx">
            <Icon icon={X} size={12} />
          </AttachmentAction>
        </AttachmentActions>
      </Attachment>
    </div>
  )
}

const styles = stylex.create({
  root: {
    marginInline: "auto",
    display: "flex",
    width: "100%",
    maxWidth: "24rem",
    flexDirection: "column",
    gap: "0.75rem",
    paddingBlock: "3rem",
  },
  image: { aspectRatio: "1 / 1", width: "100%", objectFit: "cover" },
  full: { width: "100%" },
})
