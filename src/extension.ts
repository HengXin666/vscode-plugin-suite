import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

import { GitHubVsixSuiteUpdateManager } from "./vendor/githubUpdater";

type SuiteComponent = {
  id: string;
  displayName: string;
  assetPrefix: string;
  repository: string;
};

type SuiteManifest = {
  name: string;
  version: string;
  components: SuiteComponent[];
};

let updater: GitHubVsixSuiteUpdateManager;
const githubTokenKey = "hengxinPluginSuite.githubToken";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const manifest = await readManifest(context);
  updater = new GitHubVsixSuiteUpdateManager(context, {
    owner: "HengXin666",
    repo: "vscode-plugin-suite",
    displayName: "HengXin Plugin Suite",
    stateKeyPrefix: "hengxinPluginSuite.updater",
    tokenProvider: () => context.secrets.get(githubTokenKey),
    components: manifest.components.map((component) => {
      const releaseRepository = parseRepository(component.repository);
      return {
        extensionId: component.id,
        displayName: component.displayName,
        assetPattern: new RegExp(`^${escapeRegExp(component.assetPrefix)}-\\d+(?:\\.\\d+){1,3}(?:-[0-9A-Za-z.-]+)?\\.vsix$`, "i"),
        releaseOwner: releaseRepository.owner,
        releaseRepo: releaseRepository.repo
      };
    })
  });
  context.subscriptions.push(updater);

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 90);
  status.text = "$(extensions) HengXin Suite";
  status.tooltip = "统一检查 HengXin 插件套件更新";
  status.command = "hengxinSuite.checkForUpdates";
  status.show();
  context.subscriptions.push(status);

  const syncAutomaticChecks = (): void => {
    updater.setAutomaticChecksEnabled(vscode.workspace.getConfiguration("hengxinSuite").get("autoCheckUpdates", true));
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("hengxinSuite.checkForUpdates", () => updater.checkForUpdates({ manual: true })),
    vscode.commands.registerCommand("hengxinSuite.configureGitHubToken", () => configureGitHubToken(context)),
    vscode.commands.registerCommand("hengxinSuite.showComponents", () => showComponents(manifest)),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("hengxinSuite.autoCheckUpdates")) {
        syncAutomaticChecks();
      }
    })
  );
  syncAutomaticChecks();
}

async function configureGitHubToken(context: vscode.ExtensionContext): Promise<void> {
  const value = await vscode.window.showInputBox({
    title: "配置 GitHub Token",
    prompt: "用于提高 GitHub API 限额；Token 保存在 VS Code SecretStorage，不会写入 settings.json。留空可清除。",
    password: true,
    ignoreFocusOut: true
  });
  if (value === undefined) {
    return;
  }
  if (!value.trim()) {
    await context.secrets.delete(githubTokenKey);
    await vscode.window.showInformationMessage("已清除 Suite Manager 的 GitHub Token。");
    return;
  }
  await context.secrets.store(githubTokenKey, value.trim());
  const picked = await vscode.window.showInformationMessage("GitHub Token 已安全保存。", "立即检查");
  if (picked === "立即检查") {
    await updater.checkForUpdates({ manual: true });
  }
}

async function readManifest(context: vscode.ExtensionContext): Promise<SuiteManifest> {
  const contents = await fs.readFile(path.join(context.extensionPath, "suite.json"), "utf8");
  return JSON.parse(contents) as SuiteManifest;
}

async function showComponents(manifest: SuiteManifest): Promise<void> {
  const items = manifest.components.map((component) => {
    const extension = vscode.extensions.getExtension(component.id);
    const packageJson = extension?.packageJSON as { version?: unknown } | undefined;
    const version = typeof packageJson?.version === "string" ? packageJson.version : "未安装";
    return {
      label: component.displayName,
      description: version,
      detail: component.repository
    };
  });
  await vscode.window.showQuickPick(items, {
    title: `HengXin Plugin Suite ${manifest.version}`,
    placeHolder: "当前安装的组件版本"
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseRepository(repository: string): { owner: string; repo: string } {
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) {
    throw new Error(`无效的 GitHub 仓库：${repository}`);
  }
  return { owner, repo };
}
