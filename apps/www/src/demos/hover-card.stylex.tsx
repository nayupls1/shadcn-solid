import * as stylex from "@stylexjs/stylex"
import { colors } from "@shadcn-solid/stylex/tokens.stylex"
import { Button, type ButtonProps } from "@shadcn-solid/stylex/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@shadcn-solid/stylex/ui/hover-card"

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger delay={10} closeDelay={100} render={(p) => <Button {...(p as ButtonProps)} variant="link" />}>
        Hover Here
      </HoverCardTrigger>
      <HoverCardContent xstyle={styles.content}>
        <div {...stylex.attrs(styles.handle)}>@nextjs</div>
        <div>The React Framework – created and maintained by @vercel.</div>
        <div {...stylex.attrs(styles.joined)}>Joined December 2021</div>
      </HoverCardContent>
    </HoverCard>
  )
}

const styles = stylex.create({
  content: { display: "flex", width: "16rem", flexDirection: "column", gap: "0.125rem" },
  handle: { fontWeight: 600 },
  joined: { marginTop: "0.25rem", fontSize: "0.75rem", lineHeight: "1rem", color: colors.mutedForeground },
})
