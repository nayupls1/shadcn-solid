import { mergeProps } from "base-ui-solidjs/merge-props"

type AnyProps = Record<string, unknown>

/**
 * Props for base-ui-solidjs's `useRender`, as a merge function instead of an object or getter.
 *
 * `useRender` resolves children through `params.props?.children`, so a `get props()` getter (or a
 * memo read there) runs inside the children's insert: every change to a prop or state value then
 * re-creates the whole subtree. A function input has no `children` key, and Base UI calls it
 * inside its props memo with the props merged so far, so it stays reactive without that.
 *
 *   useRender({ ..., props: renderProps(() => mergeProps({ class: cls() }, rest)) })
 */
export function renderProps(compute: () => AnyProps): AnyProps {
  return ((previous: AnyProps) => mergeProps<AnyProps>(previous, compute())) as unknown as AnyProps
}
