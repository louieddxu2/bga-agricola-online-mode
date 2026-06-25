param(
  [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$manifestPath = Join-Path $root "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
$packageName = "bga-agricola-compact-panel-v$version.zip"
$dist = Join-Path $root $OutputDir
$stage = Join-Path $dist "_stage"
$zipPath = Join-Path $dist $packageName

if (Test-Path $stage) {
  Remove-Item -LiteralPath $stage -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $stage | Out-Null
New-Item -ItemType Directory -Force -Path $dist | Out-Null

$items = @(
  "manifest.json",
  "content",
  "styles",
  "README.md",
  "RELEASE.md",
  "LICENSE"
)

foreach ($item in $items) {
  $source = Join-Path $root $item
  if (-not (Test-Path $source)) {
    continue
  }

  $destination = Join-Path $stage $item
  if ((Get-Item $source).PSIsContainer) {
    Copy-Item -LiteralPath $source -Destination $destination -Recurse
  } else {
    Copy-Item -LiteralPath $source -Destination $destination
  }
}

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zipPath -Force
Remove-Item -LiteralPath $stage -Recurse -Force

Write-Host "Created $zipPath"
