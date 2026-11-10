import * as stylex from "@stylexjs/stylex"

/** Put on `Avatar` (Tailwind's `group/avatar`); children read its `data-size` with `stylex.when.ancestor`. */
export const avatarMarker = stylex.defineMarker()
/** Put on `AvatarGroup` (Tailwind's `group/avatar-group`). */
export const avatarGroupMarker = stylex.defineMarker()
