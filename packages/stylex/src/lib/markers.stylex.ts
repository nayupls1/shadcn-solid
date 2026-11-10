import * as stylex from "@stylexjs/stylex"

/**
 * Named markers for `stylex.when.ancestor(...)`: StyleX's version of Tailwind's named groups
 * (`group/avatar`, `group/message`, ...). A named marker keeps nested components from matching
 * each other's ancestor conditions, which the shared `stylex.defaultMarker()` would.
 */
export const avatarMarker = stylex.defineMarker()
export const avatarGroupMarker = stylex.defineMarker()
export const bubbleMarker = stylex.defineMarker()
export const messageMarker = stylex.defineMarker()
export const markerMarker = stylex.defineMarker()
export const attachmentMarker = stylex.defineMarker()
export const traceTriggerMarker = stylex.defineMarker()
export const traceLineMarker = stylex.defineMarker()
export const codeBlockMarker = stylex.defineMarker()
export const scrollerMarker = stylex.defineMarker()
export const choiceMarker = stylex.defineMarker()
