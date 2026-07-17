#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

if [[ -n "${CODE_BIN:-}" ]]; then
  code_bin="$CODE_BIN"
elif command -v code >/dev/null 2>&1; then
  code_bin="code"
elif command -v code-insiders >/dev/null 2>&1; then
  code_bin="code-insiders"
elif command -v codium >/dev/null 2>&1; then
  code_bin="codium"
else
  echo "VS Code CLI not found. Set CODE_BIN to the desired executable." >&2
  exit 1
fi

found=false
for vsix in ./*.vsix; do
  [[ -e "$vsix" ]] || continue
  found=true
  echo "Installing $(basename "$vsix")"
  "$code_bin" --install-extension "$vsix" --force
done

if [[ "$found" != true ]]; then
  echo "No VSIX files found next to install.sh" >&2
  exit 1
fi

echo "All suite extensions are installed. Reload all VS Code windows to activate them."
