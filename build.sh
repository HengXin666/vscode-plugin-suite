#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

workspace_root="$(cd .. && pwd)"
updater="$workspace_root/vscode-extension-github-updater"
agent_view="$workspace_root/vscode-agent-view"
string_replacer="$workspace_root/vscode-string-replacer"
window_deck="$workspace_root/vscode-window-switch"

for project in "$updater" "$agent_view" "$string_replacer" "$window_deck"; do
  if [[ ! -x "$project/build.sh" ]]; then
    echo "Missing executable build.sh: $project/build.sh" >&2
    exit 1
  fi
done

"$updater/build.sh"
"$agent_view/build.sh"
"$string_replacer/build.sh"
"$window_deck/build.sh"

version="$(node -p "require('./suite.json').version")"
bundle_dir="$PWD/dist/bundle"
rm -rf "$PWD/dist"
mkdir -p "$bundle_dir"

copy_latest_vsix() {
  local project_dir="$1"
  local package_name
  local package_version
  package_name="$(node -p "require('$project_dir/package.json').name")"
  package_version="$(node -p "require('$project_dir/package.json').version")"
  cp "$project_dir/$package_name-$package_version.vsix" "$bundle_dir/"
}

copy_latest_vsix "$agent_view"
copy_latest_vsix "$string_replacer"
copy_latest_vsix "$window_deck"
cp install.sh install.ps1 suite.json "$bundle_dir/"

tar -C "$bundle_dir" -czf "$PWD/dist/vscode-plugin-suite-$version.tar.gz" .
if command -v zip >/dev/null 2>&1; then
  (
    cd "$bundle_dir"
    zip -qr "../vscode-plugin-suite-$version.zip" .
  )
fi

cp "$bundle_dir"/*.vsix "$PWD/dist/"
echo "Suite artifacts written to $PWD/dist"
