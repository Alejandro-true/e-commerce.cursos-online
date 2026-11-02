// Etapa 12 RF07: listado de cursos y reproductor protegido. No se envia estudianteId.
const $ = id => document.getElementById(id);
async function pedir(url) {
  const r = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
  if (r.status === 401) { window.location.href = '/ingresar'; throw new Error('Inicia sesion'); }
  if (r.status === 403) throw new Error('Acceso denegado o compra ya no vigente (403).');
  if (!r.ok) {
    let mensaje = 'Error HTTP ' + r.status;
    try { const data = await r.json(); mensaje = data.message || data.error || mensaje; } catch (_) {}
    throw new Error(mensaje);
  }
  return r.json();
}

(function prepararReproductor() {
  const hoja = document.createElement('link');
  hoja.rel = 'stylesheet';
  hoja.href = '/css/aula-video-demo.css';
  document.head.appendChild(hoja);
  const modal = document.createElement('section');
  modal.id = 'aula-video-modal';
  modal.className = 'av-overlay';
  modal.hidden = true;
  modal.innerHTML = '<div class="av-dialog" role="dialog" aria-modal="true" aria-labelledby="av-titulo">' +
    '<div class="av-header"><h2 id="av-titulo">Contenido del curso</h2>' +
    '<button type="button" id="av-cerrar" class="av-close" aria-label="Cerrar">Cerrar</button></div>' +
    '<p id="av-estado" class="muted" role="status"></p>' +
    '<div id="av-modulos"></div>' +
    '<div id="av-reproductor" hidden><h3 id="av-leccion"></h3><video id="av-video" controls playsinline preload="metadata" referrerpolicy="no-referrer"></video>' +
    '<p class="muted">Video local de demostracion. URL valida 3 minutos y acceso comprobado en cada peticion.</p></div></div>';
  document.body.appendChild(modal);
  const cerrar = () => {
    modal.hidden = true;
    $('av-video').pause();
    $('av-video').removeAttribute('src');
    $('av-video').load();
  };
  $('av-cerrar').addEventListener('click', cerrar);
  modal.addEventListener('click', e => { if (e.target === modal) cerrar(); });
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) cerrar(); });
})();

function elemento(tag, texto, clase) {
  const e = document.createElement(tag);
  if (texto != null) e.textContent = texto;
  if (clase) e.className = clase;
  return e;
}

async function mostrarContenido(cursoId) {
  const modal = $('aula-video-modal');
  modal.hidden = false;
  $('av-reproductor').hidden = true;
  $('av-video').removeAttribute('src');
  $('av-estado').textContent = 'Comprobando permisos de acceso...';
  $('av-modulos').replaceChildren();
  try {
    const datos = await pedir('/api/demo/video/cursos/' + encodeURIComponent(cursoId) + '/contenido');
    $('av-titulo').textContent = datos.cursoTitulo + ' — version ' + datos.numeroVersion;
    $('av-estado').textContent = 'Selecciona una leccion para continuar.';
    if (!datos.modulos.length) {
      $('av-modulos').appendChild(elemento('p', 'Esta version aun no contiene modulos.'));
    }
    for (const m of datos.modulos) {
      const bloque = elemento('section', null, 'av-modulo');
      bloque.appendChild(elemento('h3', m.titulo));
      for (const l of m.lecciones) {
        const fila = elemento('div', null, 'av-leccion-row');
        const info = elemento('div');
        info.appendChild(elemento('strong', l.titulo));
        info.appendChild(elemento('p', l.tipo === 'VIDEO' ? 'Leccion de video' : 'Leccion de lectura', 'muted'));
        fila.appendChild(info);
        if (l.tipo === 'VIDEO') {
          const boton = elemento('button', l.disponible ? 'Reproducir' : 'Video pendiente');
          boton.type = 'button';
          boton.disabled = !l.disponible;
          boton.addEventListener('click', () => reproducir(l));
          fila.appendChild(boton);
        } else if (l.tipo === 'LECTURA') {
          const boton = elemento('button', 'Leer');
          boton.type = 'button';
          boton.addEventListener('click', () => {
            $('av-video').pause(); $('av-video').removeAttribute('src');
            $('av-reproductor').hidden = false;
            $('av-video').hidden = true;
            $('av-leccion').textContent = l.titulo;
            let lectura = $('av-lectura');
            if (!lectura) { lectura = elemento('p'); lectura.id = 'av-lectura'; $('av-reproductor').appendChild(lectura); }
            lectura.textContent = l.contenidoTexto || 'No hay contenido de lectura.';
            $('av-estado').textContent = 'Lectura autorizada.';
          });
          fila.appendChild(boton);
        }
        bloque.appendChild(fila);
      }
      $('av-modulos').appendChild(bloque);
    }
  } catch (e) { $('av-estado').textContent = e.message; }
}

async function reproducir(leccion) {
  $('av-estado').textContent = 'Validando compra y generando enlace temporal...';
  try {
    const respuesta = await pedir('/api/demo/video/lecciones/' + encodeURIComponent(leccion.id) + '/enlace');
    const lectura = $('av-lectura');
    if (lectura) lectura.remove();
    const reproductor = $('av-video');
    reproductor.hidden = false;
    $('av-leccion').textContent = leccion.titulo;
    $('av-reproductor').hidden = false;
    reproductor.src = respuesta.urlTemporal;
    reproductor.load();
    $('av-estado').textContent = 'Enlace emitido. La reproduccion requiere una compra vigente.';
    // La mayoria de navegadores solo permiten autoplay tras accion del usuario.
    reproductor.play().catch(() => { $('av-estado').textContent = 'Pulsa Play en el reproductor.'; });
  } catch (e) { $('av-estado').textContent = e.message; }
}

async function cargar() {
  const msg = $('mensaje'), panel = $('cursos');
  panel.replaceChildren(); msg.className = 'notice'; msg.textContent = 'Consultando...';
  try {
    const [cuenta, datos] = await Promise.all([
      pedir('/api/demo/cuenta/yo'), pedir('/api/demo/cuenta/mis-cursos')
    ]);
    $('identidad').textContent = 'Estudiante: ' + cuenta.nombre + ' (' + cuenta.email + ')';
    if (!datos.length) {
      msg.textContent = 'Todavia no tienes cursos con acceso ACTIVO. Solicita una compra y espera la aprobacion.';
      return;
    }
    msg.textContent = 'Cursos con acceso activo: ' + datos.length;
    for (const c of datos) {
      const art = elemento('article', null, 'card');
      art.appendChild(elemento('h3', c.titulo));
      art.appendChild(elemento('p', 'Version adquirida: ' + c.numeroVersion));
      art.appendChild(elemento('span', 'ACTIVO', 'badge ACTIVO'));
      art.appendChild(elemento('p', 'Accede a las lecciones de tu version adquirida.', 'muted'));
      const boton = elemento('button', 'Ver lecciones');
      boton.type = 'button';
      boton.addEventListener('click', () => mostrarContenido(c.cursoId));
      art.appendChild(boton);
      panel.appendChild(art);
    }
  } catch(e) { msg.className = 'notice error'; msg.textContent = e.message; }
}
$('refrescar').onclick = cargar;
cargar();
