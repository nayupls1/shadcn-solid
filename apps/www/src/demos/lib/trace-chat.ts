import { createChat } from "./fake-chat"

// The script of shadcn's trace demo.
export const traceChat = createChat()
  .user("Why does pnpm install fail in CI?")
  .assistant([
    {
      kind: "reasoning",
      text: "CI installs with a frozen lockfile, so the install stops when package.json and pnpm-lock.yaml disagree. I should check what the last commit changed, then reproduce the install.",
      delayMs: 40,
    },
    { kind: "tool", command: "pnpm --version", sleep: 700, output: "10.18.0" },
    {
      kind: "tool",
      command: "git diff --stat HEAD~1 -- package.json pnpm-lock.yaml",
      sleep: 900,
      output: " package.json | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)",
    },
    {
      kind: "tool",
      command: "pnpm install --frozen-lockfile",
      sleep: 1200,
      error:
        'ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because pnpm-lock.yaml is not up to date with package.json',
    },
    { kind: "source", url: "https://pnpm.io/cli/install#--frozen-lockfile", title: "pnpm install | pnpm.io" },
    { kind: "source", url: "https://pnpm.io/continuous-integration", title: "Continuous Integration | pnpm.io" },
    { kind: "sleep", ms: 1000 },
    {
      kind: "text",
      text: "The last commit bumped a version in package.json without updating pnpm-lock.yaml, so the frozen install fails. Run pnpm install locally and commit the lockfile.",
    },
  ])
