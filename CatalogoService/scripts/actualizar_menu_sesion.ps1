$ErrorActionPreference = 'Stop'
$raiz = (Get-Location).Path

$menu = @'
<nav aria-label="Navegacion principal">
  <a th:href="@{/demo/aula/catalogo}">Catalogo</a>
  <a th:if="${navEstudiante}" th:href="@{/demo/aula/mis-cursos}">Mis cursos</a>
  <a th:if="${navAdmin}" th:href="@{/demo/aula/admin}">Panel administrador</a>
  <a th:if="${navAutenticado}" th:href="@{/cuenta}">Mi cuenta</a>
  <a th:unless="${navAutenticado}" th:href="@{/ingresar}">Iniciar sesion</a>
  <a th:unless="${navAutenticado}" th:href="@{/registro}">Registrarse</a>
  <form th:if="${navAutenticado}" th:action="@{/salir}" method="post" style="margin:0">
    <button type="submit" class="secondary" style="padding:0;background:transparent;color:#1556a5;font-size:14px;font-weight:650;">Cerrar sesion</button>
  </form>
</nav>
'@

$rutas = @(
  'src/main/resources/templates/aula-catalogo.html',
  'src/main/resources/templates/aula-mis-cursos.html',
  'src/main/resources/templates/aula-admin.html'
)

$archivosEditados = @{}
$regex = [regex]::new('<nav\b[^>]*>[\s\S]*?</nav>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
foreach ($ruta in $rutas) {
    $full = Join-Path $raiz $ruta
    if (-not (Test-Path $full)) { throw "No se encuentra el archivo $ruta. Ejecuta desde CatalogoService." }
    $contenido = [System.IO.File]::ReadAllText($full, [System.Text.Encoding]::UTF8)
    $coincidencias = $regex.Matches($contenido)
    if ($coincidencias.Count -ne 1) { throw "Se esperaba un menu <nav> en $ruta; se encontraron $($coincidencias.Count)." }
    $m = $coincidencias[0]
    $contenido = $contenido.Substring(0, $m.Index) + $menu + $contenido.Substring($m.Index + $m.Length)
    if ($ruta -like '*aula-catalogo.html') {
        if (-not $contenido.Contains('name="ab-rol-admin"')) {
            $meta = '<meta name="ab-rol-admin" th:content="${navAdmin}">'
            $pos = $contenido.IndexOf('</head>')
            if ($pos -lt 0) { throw "No se encontro </head> en $ruta" }
            $contenido = $contenido.Insert($pos, $meta + "`n")
        }
    }
    $archivosEditados[$full] = $contenido
}

$jsRuta = 'src/main/resources/static/js/aula-catalogo.js'
$jsFull = Join-Path $raiz $jsRuta
if (-not (Test-Path $jsFull)) { throw "No se encuentra $jsRuta" }
$js = [System.IO.File]::ReadAllText($jsFull, [System.Text.Encoding]::UTF8)
if (-not $js.Contains('const modoAdmin=')) {
    $patron1 = 'let comprasActuales=[];'
    $reemplazo1 = @'
let comprasActuales=[];
const modoAdmin = document.querySelector('meta[name="ab-rol-admin"]')?.content === 'true';
'@
    if (-not $js.Contains($patron1)) { throw 'No se encontro el punto de insercion de modoAdmin en aula-catalogo.js' }
    $js = $js.Replace($patron1, $reemplazo1)

    $patron2 = 'async function cargarIdentidad(){'
    $reemplazo2 = @'
async function cargarIdentidad(){
 if(modoAdmin){
  identidad=null;
  $('sesion').textContent='Has iniciado sesion como administrador. Puedes consultar el catalogo; solo los estudiantes pueden comprar.';
  $('seccion-compras').hidden=true;
  return;
 }
'@
    if (-not $js.Contains($patron2)) { throw 'No se encontro cargarIdentidad en aula-catalogo.js' }
    $js = $js.Replace($patron2, $reemplazo2)

    $patron3 = "else{btn.textContent=identidad?'Solicitar compra':'Regístrate para comprar';btn.onclick=()=>comprar(curso.id,btn);}"
    $reemplazo3 = "else if(modoAdmin){btn.textContent='Solo estudiantes pueden comprar';btn.disabled=true;}" + "`n   " + $patron3
    if (-not $js.Contains($patron3)) { throw 'No se encontro la linea de compra en aula-catalogo.js; no se ha editado ningun archivo.' }
    $js = $js.Replace($patron3, $reemplazo3)
}
$archivosEditados[$jsFull] = $js

$utf8 = New-Object System.Text.UTF8Encoding($false)
foreach ($full in $archivosEditados.Keys) {
    $respaldo = $full + '.bak-menu-11-4-1'
    if (-not (Test-Path $respaldo)) { Copy-Item -LiteralPath $full -Destination $respaldo }
    [System.IO.File]::WriteAllText($full, $archivosEditados[$full], $utf8)
    Write-Host "Actualizado: $full"
}
Write-Host 'Menu adaptado a visitantes, estudiantes y administradores.'
