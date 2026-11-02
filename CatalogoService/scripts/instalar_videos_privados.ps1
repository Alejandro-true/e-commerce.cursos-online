# Ejecutar DESDE CatalogoService (raiz), con PowerShell.
# Crea la carpeta fuera de Git, configura el .env, y agrega SOLO el JS al panel.
$ErrorActionPreference = 'Stop'
if (-not (Test-Path '.env')) { throw 'Ejecuta este script desde la carpeta CatalogoService, que contiene .env' }
$directorio = Join-Path $env:USERPROFILE 'AulaBreve\almacenamiento\videos'
New-Item -ItemType Directory -Force -Path $directorio | Out-Null
$propiedad = 'VIDEO_STORAGE_DIR=' + $directorio.Replace('\','/')
$envActual = [System.IO.File]::ReadAllText((Resolve-Path '.env').Path)
if ([regex]::IsMatch($envActual, '(?m)^VIDEO_STORAGE_DIR=')) {
  $envNuevo = [regex]::Replace($envActual, '(?m)^VIDEO_STORAGE_DIR=.*$', $propiedad)
} else {
  $envNuevo = $envActual.TrimEnd("`r", "`n") + "`r`n" + $propiedad + "`r`n"
}
if ($envNuevo -ne $envActual) {
  # No crear copia .env.bak dentro del repositorio: podria contener claves.
  [System.IO.File]::WriteAllText((Resolve-Path '.env').Path, $envNuevo, [System.Text.UTF8Encoding]::new($false))
}
$propsRuta = 'src/main/resources/application-demo.properties'
if (-not (Test-Path $propsRuta)) { throw "No se encontro $propsRuta" }
$props = [System.IO.File]::ReadAllText((Resolve-Path $propsRuta).Path)
if (-not $props.Contains('spring.servlet.multipart.max-file-size')) {
  Copy-Item $propsRuta ($propsRuta + '.bak-video') -Force
  $props = $props.TrimEnd("`r", "`n") + "`r`n# Carga privada de videos, solo DEMO`r`nspring.servlet.multipart.max-file-size=200MB`r`nspring.servlet.multipart.max-request-size=205MB`r`n"
  [System.IO.File]::WriteAllText((Resolve-Path $propsRuta).Path, $props, [System.Text.UTF8Encoding]::new($false))
}
$htmlRuta = 'src/main/resources/templates/aula-admin.html'
if (-not (Test-Path $htmlRuta)) { throw "No se encontro $htmlRuta" }
$html = [System.IO.File]::ReadAllText((Resolve-Path $htmlRuta).Path)
$etiqueta = '<script src="/js/aula-admin-videos.js" defer></script>'
if (-not $html.Contains($etiqueta)) {
  if (-not $html.Contains('</body>')) { throw 'No se encontro </body> para insertar el JS' }
  Copy-Item $htmlRuta ($htmlRuta + '.bak-video') -Force
  $html = $html.Replace('</body>', $etiqueta + '</body>')
  [System.IO.File]::WriteAllText((Resolve-Path $htmlRuta).Path, $html, [System.Text.UTF8Encoding]::new($false))
}
Write-Host "Carpeta privada preparada: $directorio"
Write-Host 'Configuracion VIDEO_STORAGE_DIR y multipart verificada.'
Write-Host 'Panel actualizado. El archivo aula-admin-contenido.js NO fue reemplazado.'
