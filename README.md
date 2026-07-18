# HengXin VS Code Plugin Suite

这个仓库统一构建和发布四个 VS Code 插件：

- Agent View
- String Replacer
- Window Deck
- Open in New Window

各组件仍然保持独立版本、独立 GitHub Release 和独立更新；Suite Release 同时提供一次安装全部组件的压缩包和 `HengXin Plugin Suite` 管理扩展。

安装 Suite Manager 后，状态栏会显示 `HengXin Suite`：点击后会直接检查 `suite.json` 中每个组件各自仓库的最新 Release，比较所有已安装组件版本，并一次安装全部有更新的 VSIX；不再依赖可能滞后的 Suite Release。也可以在命令面板运行 `HengXin Plugin Suite: 检查整套更新`。默认每 24 小时自动检查一次；公开仓库检查不消耗 GitHub REST API 配额，配置 Token 仅作为页面检查失败后的 API 回退。

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
open-new-window/
vscode-plugin-suite/
```

然后执行：

```bash
./build.sh
```

产物位于 `dist/`，其中包含四个组件 VSIX、Suite Manager VSIX、安装脚本和套件清单。
