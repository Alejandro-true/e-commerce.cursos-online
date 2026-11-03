$ErrorActionPreference = "Stop"
$envFile = Join-Path (Get-Location) ".env"
if (-not (Test-Path $envFile)) { throw "Ejecuta el script desde CatalogoService; falta .env" }
$actual = Get-Content $envFile
if (@($actual | Where-Object { $_ -match '^INTERNAL_SERVICE_KEY=' }).Count -gt 0) {
    Write-Host "INTERNAL_SERVICE_KEY ya existe. No se ha sobrescrito ni mostrado."
    exit 0
}
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
$clave = [Convert]::ToBase64String($bytes)
Add-Content -Path $envFile -Value "INTERNAL_SERVICE_KEY=$clave" -Encoding UTF8
Write-Host "Clave interna generada en .env. NO compartas este archivo ni subas su contenido a Git."
