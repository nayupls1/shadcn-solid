import { render } from "@solidjs/web"
import "./app.css"
import { App } from "./App"

if (import.meta.env.DEV) {
  // StyleX serves its dev stylesheet from a virtual URL; the build appends it to the CSS asset.
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = "/virtual:stylex.css"
  document.head.append(link)
  void import("virtual:stylex:runtime" as string)
}

render(() => <App />, document.getElementById("root")!)
