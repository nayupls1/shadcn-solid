import * as stylex from "@stylexjs/stylex"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@shadcn-solid/stylex/ui/avatar"

export default function AvatarDemo() {
  return (
    <div {...stylex.attrs(styles.root)}>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" xstyle={styles.grayscale} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
        <AvatarFallback>ER</AvatarFallback>
        <AvatarBadge xstyle={styles.online} />
      </Avatar>
      <AvatarGroup xstyle={styles.grayscale}>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
          <AvatarFallback>LR</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    </div>
  )
}

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: { default: "1.5rem", "@media (min-width: 48rem)": "3rem" },
  },
  grayscale: { filter: "grayscale(100%)" },
  // Tailwind's green-600 / green-800.
  online: { backgroundColor: "light-dark(oklch(62.7% 0.194 149.214), oklch(44.8% 0.119 151.328))" },
})
