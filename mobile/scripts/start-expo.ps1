# Mantem os caches pesados fora do projeto, usando o perfil local do Windows.
$ErrorActionPreference = "Stop"

$localAppData = [Environment]::GetFolderPath("LocalApplicationData")
if ([string]::IsNullOrWhiteSpace($localAppData)) {
  $localAppData = $env:TEMP
}

$cacheRoot = Join-Path $localAppData "borderless-dev-cache"
$dirs = @("npm", "expo", "temp", "metro")

foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path (Join-Path $cacheRoot $dir) | Out-Null
}

$env:TEMP = "$cacheRoot\temp"
$env:TMP = "$cacheRoot\temp"
$env:npm_config_cache = "$cacheRoot\npm"
$env:EXPO_HOME = "$cacheRoot\expo"
$env:METRO_CACHE = "$cacheRoot\metro"
# Evita a consulta de versões do Expo CLI que falha no Node 24/Undici com
# "Body has already been read". Isso não deixa o aplicativo sem internet.
$env:EXPO_OFFLINE = "1"

Write-Host "Caches apontando para $cacheRoot" -ForegroundColor Green
Write-Host "  npm:   $env:npm_config_cache"
Write-Host "  expo:  $env:EXPO_HOME"
Write-Host "  metro: $env:METRO_CACHE"
Write-Host "  temp:  $env:TEMP"
Write-Host "  Expo CLI: offline (Firebase e APIs continuam online)"

Set-Location $PSScriptRoot\..

if (-not (Test-Path ".\node_modules\expo\package.json")) {
  Write-Host "Dependencias do mobile nao encontradas. Executando npm install..." -ForegroundColor Yellow
  npm install
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

# Usa o CLI local (SDK 54) em vez de baixar expo@latest via npx.
npm exec -- expo start @args
