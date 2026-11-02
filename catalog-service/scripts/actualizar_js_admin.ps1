# Ejecutar desde la carpeta raiz CatalogoService.
# Modifica SOLO los wrappers de fetch de los dos JS actuales; conserva los
# cambios que ya hiciste para el orden automatico de lecciones.
$ErrorActionPreference = 'Stop'
$archivos = @(
  'src/main/resources/static/js/aula-admin-cursos.js',
  'src/main/resources/static/js/aula-admin-contenido.js'
)
foreach ($ruta in $archivos) {
  if (-not (Test-Path $ruta)) { throw "No se encontro $ruta" }
  $contenido = [System.IO.File]::ReadAllText((Resolve-Path $ruta).Path)
  if ($contenido.Contains('window.AulaAdminFetch(')) {
    Write-Host "Ya adaptado: $ruta"
    continue
  }
  $inicio = $contenido.IndexOf('    const clave = el(')
  if ($inicio -lt 0) { throw "No se encontro wrapper DEMO esperado en $ruta; no se cambio nada" }
  $fn = $contenido.LastIndexOf('  async function ', $inicio)
  $siguiente = $contenido.IndexOf("`n  function ", $inicio)
  if ($siguiente -lt 0) { throw "No se encontro el fin de la funcion en $ruta" }
  $viejo = $contenido.Substring($fn, $siguiente-$fn)
  if ($ruta.EndsWith('aula-admin-cursos.js')) {
    $nuevo = @'
  async function apiCursos(path = '', opciones = {}) {
    return window.AulaAdminFetch(raiz + path, opciones);
  }
'@
  } else {
    $nuevo = @'
  async function api(ruta, opciones = {}) {
    return window.AulaAdminFetch(root + ruta, opciones);
  }
'@
  }
  $modificado = $contenido.Replace($viejo,$nuevo)
  if ($modificado -eq $contenido) { throw "No pudo modificar $ruta" }
  Copy-Item $ruta ($ruta + '.bak-11-4') -Force
  [System.IO.File]::WriteAllText((Resolve-Path $ruta).Path, $modificado,
      [System.Text.UTF8Encoding]::new($false))
  Write-Host "Actualizado: $ruta (copia .bak-11-4 guardada)"
}
