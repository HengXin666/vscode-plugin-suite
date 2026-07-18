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

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const manifest = await readManifest(context);
  updater = new GitHubVsixSuiteUpdateManager(context, {
    owner: "HengXin666",
    repo: "vscode-plugin-suite",
    displayName: "HengXin Plugin Suite",
    stateKeyPrefix: "hengxinPluginSuite.updater",
    components: manifest.components.map((component) => ({
      extensionId: component.id,
      displayName: component.displayName,
      assetPattern: new RegExp(`^${escapeRegExp(component.assetPrefix)}-\\d+(?:\\.\\d+){1,3}(?:-[0-9A-Za-z.-]+)?\\.vsix$`, "i")
    }))
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
    vscode.commands.registerCommand("hengxinSuite.showComponents", () => showComponents(manifest)),
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("hengxinSuite.autoCheckUpdates")) {
        syncAutomaticChecks();
      }
    })
  );
  syncAutomaticChecks();
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
