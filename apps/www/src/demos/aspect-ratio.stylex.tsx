import * as stylex from "@stylexjs/stylex"
import { AspectRatio } from "@shadcn-solid/stylex/ui/aspect-ratio"
import { colors, radius } from "@shadcn-solid/stylex/tokens.stylex"

export default function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9} xstyle={styles.root}>
      <img src="https://avatar.vercel.sh/shadcn1" alt="Photo" {...stylex.attrs(styles.image)} />
      {/* `dark:brightness-20`: `light-dark()` only takes colors, and brightness(0.2) is the same as
          an 80% black layer on top. */}
      <div aria-hidden="true" {...stylex.attrs(styles.dim)} />
    </AspectRatio>
  )
}

const styles = stylex.create({
  root: {
    width: "100%",
    maxWidth: "24rem",
    borderRadius: radius.lg,
    backgroundColor: colors.muted,
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    borderRadius: radius.lg,
    objectFit: "cover",
    filter: "grayscale(100%)",
  },
  dim: {
    position: "absolute",
    inset: 0,
    borderRadius: radius.lg,
    backgroundColor: "light-dark(transparent, rgb(0 0 0 / 0.8))",
  },
})
