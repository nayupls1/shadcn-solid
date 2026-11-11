#!/usr/bin/env bash
# Smoke-tests a compiled CLI: init + add --all for both styles in throwaway projects, without
# installing packages. Runs on Linux and on Windows (Git Bash).
# Usage: scripts/smoke.sh <path-to-binary>
set -euo pipefail

bin="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
fail() { echo "smoke: $*" >&2; exit 1; }

"$bin" --version
"$bin" --help >/dev/null

project() {
  mkdir -p "$work/$1/src" && cd "$work/$1"
  echo '{ "name": "smoke", "private": true, "dependencies": { "solid-js": "2.0.0-rc.21", "@solidjs/web": "2.0.0-rc.21" } }' > package.json
}

# Tailwind, with a tsconfig "@/*" alias.
project tailwind
echo '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }' > tsconfig.json
printf '@import "tailwindcss";\n\nbody { margin: 0; }\n' > src/index.css
"$bin" init -y --no-install
"$bin" add --all -y --no-install
grep -q '"style": "tailwind"' components.json || fail "components.json"
grep -q '@import "./shadcn.css";' src/index.css || fail "index.css not merged"
grep -q 'body { margin: 0; }' src/index.css || fail "index.css lost its content"
test -f src/shadcn.css || fail "shadcn.css"
grep -q 'from "../../lib/utils"' src/components/ui/button.tsx || fail "button.tsx import not rewritten"
grep -q 'from "../../lib/primitives/message-scroller/index"' src/components/ui/message-scroller.tsx || fail "primitives import"
! grep -rq '@@' src || fail "unresolved placeholder"
test "$(ls src/components/ui | wc -l)" -eq 65 || fail "expected 64 components + icon"
"$bin" add button -y --no-install | grep -q unchanged || fail "re-adding should leave files unchanged"
"$bin" list | grep -q "64 components" || fail "list"

# StyleX, with plain paths.
project stylex
"$bin" init --style stylex -y --no-install
"$bin" add --all -y --no-install
grep -q '"ui": "src/components/ui"' components.json || fail "components.json"
test -f src/lib/tokens.stylex.ts || fail "tokens.stylex.ts"
grep -q 'from "../../lib/tokens.stylex"' src/components/ui/button.tsx || fail "button.tsx import not rewritten"
! grep -rq '@@' src || fail "unresolved placeholder"
test "$(ls src/components/ui | wc -l)" -eq 65 || fail "expected 64 components + icon"

echo "smoke: ok"
