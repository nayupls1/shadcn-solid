import * as stylex from "@stylexjs/stylex"
import { Avatar, AvatarFallback, AvatarImage } from "@shadcn-solid/stylex/ui/avatar"
import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "@shadcn-solid/stylex/ui/bubble"
import { Marker, MarkerContent } from "@shadcn-solid/stylex/ui/marker"
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@shadcn-solid/stylex/ui/message"
import { shimmerStyles } from "@shadcn-solid/stylex/lib/shimmer"

export default function MessageDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/10.png" alt="@me" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>Deploying to prod real quick.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/02.png" alt="@rabbit" />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble variant="muted">
            <BubbleContent>It's 4:55 PM. On a Friday.</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/10.png" alt="@me" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <Bubble>
            <BubbleContent>It's a one-line change.</BubbleContent>
          </Bubble>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>
      <Message>
        <MessageAvatar>
          <Avatar>
            <AvatarImage src="/avatars/02.png" alt="@rabbit" />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <BubbleGroup>
            <Bubble variant="muted">
              <BubbleContent>It's always a one-line change 😭.</BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent>Alright, let me take a look.</BubbleContent>
              <BubbleReactions aria-label="Reactions: thumbs up">
                <span>👍</span>
              </BubbleReactions>
            </Bubble>
          </BubbleGroup>
        </MessageContent>
      </Message>
      <Marker role="status">
        <MarkerContent xstyle={shimmerStyles.shimmer}>
          <span {...stylex.attrs(styles.medium)}>Oliver</span> is typing...
        </MarkerContent>
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
    gap: "1.5rem",
    paddingBlock: "3rem",
  },
  medium: { fontWeight: 500 },
})
