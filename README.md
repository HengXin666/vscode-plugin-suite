# HengXin VS Code Plugin Suite

这个仓库统一构建和发布三个 VS Code 插件：

- Agent View
- String Replacer
- Window Deck

三个插件仍然保持独立版本、独立 GitHub Release 和独立自动更新；Suite Release 则提供一次安装全部组件的压缩包。

## 安装

从 GitHub Release 下载 `.zip` 或 `.tar.gz` 并解压。

Linux/macOS：

```bash
./install.sh
```

Windows PowerShell：

```powershell
.\install.ps1
```

可通过 `CODE_BIN` 环境变量或 PowerShell `-CodeBin` 参数选择 `code`、`code-insiders` 或 `codium`。

## 本地联合构建

四个 sibling 仓库需要放在同一父目录：

```text
vscode-extension-github-updater/
vscode-agent-view/
vscode-string-replacer/
vscode-window-switch/
vscode-plugin-suite/
```

然后执行：

```bash
./build.sh
```

产物位于 `dist/`。
