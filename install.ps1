param(
  [string]$CodeBin = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $CodeBin) {
  foreach ($Candidate in @("code", "code-insiders", "codium")) {
    if (Get-Command $Candidate -ErrorAction SilentlyContinue) {
      $CodeBin = $Candidate
      break
    }
  }
}

if (-not $CodeBin) {
  throw "VS Code CLI not found. Pass -CodeBin with the desired executable."
}

$VsixFiles = Get-ChildItem -Path $Root -Filter "*.vsix"
if (-not $VsixFiles) {
  throw "No VSIX files found next to install.ps1"
}

foreach ($Vsix in $VsixFiles) {
  Write-Host "Installing $($Vsix.Name)"
  & $CodeBin --install-extension $Vsix.FullName --force
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to install $($Vsix.Name)"
  }
}

Write-Host "All suite extensions are installed. Reload all VS Code windows to activate them."
