import * as stylex from "@stylexjs/stylex"

/**
 * Named markers for Tailwind's named groups (`group/card`, `group/avatar-group`, ...). A part's
 * `stylex.when.ancestor(":is([data-size=sm])", markers.card)` only matches the component's own root,
 * where `stylex.defaultMarker()` would match any marked ancestor.
 */
export const cardMarker = stylex.defineMarker()
export const avatarGroupMarker = stylex.defineMarker()
export const alertMarker = stylex.defineMarker()
