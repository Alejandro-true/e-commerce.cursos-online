/* AulaBreve RF07, subida de MP4 a lecciones VIDEO de versiones BORRADOR.
   No se envian rutas del sistema operativo, ni claves, ni estudianteId. */
(() => {
  'use strict';
  const editor = document.getElementById('seccion-contenido');
  if (!editor || !window.AulaContenido || !window.AulaAdminFetch) return;
  let contexto = null;
  let ocupado = false;
  const panel = document.createElement('section');
  panel.className = 'editor-form';
  panel.style.marginTop = '20px';
  panel.innerHTML = `
    <h3>5. Subir video MP4 privado</h3>
    <p class="muted">Selecciona una leccion VIDEO de una version BORRADOR. El MP4 se guarda fuera del proyecto y el servidor asigna su referencia privada.</p>
    <form id="form-subida-mp4" enctype="multipart/form-data">
      <label for="video-leccion-id">Leccion de video</label>
      <select id="video-leccion-id" required></select>
      <label for="video-archivo-mp4">Archivo MP4 (maximo 200 MB)</label>
      <input id="video-archivo-mp4" type="file" accept=".mp4,video/mp4" required>
      <button id="video-subir" type="submit">Subir MP4 y marcar LISTO</button>
    </form>
    <p id="video-subida-estado" class="notice" role="status">Abre un curso y selecciona una version BORRADOR.</p>`;
  editor.appendChild(panel);
  const form = document.getElementById('form-subida-mp4');
  const select = document.getElementById('video-leccion-id');
  const archivo = document.getElementById('video-archivo-mp4');
  const boton = document.getElementById('video-subir');
  const aviso = document.getElementById('video-subida-estado');
  const versionControl = document.getElementById('version-elegida');

  function notificar(mensaje, error=false) {
    aviso.textContent = mensaje;
    aviso.className = 'notice' + (error ? ' error' : '');
  }

  async function sincronizar() {
    if (!contexto?.curso?.id || ocupado) return;
    select.replaceChildren();
    try {
      const data = await window.AulaAdminFetch(
        '/api/demo/admin/contenido/' + encodeURIComponent(contexto.curso.id));
      const version = data.versiones.find(v => v.id === versionControl.value);
      const editable = version && version.estado === 'BORRADOR' && data.estado !== 'ARCHIVADO';
      if (editable) {
        for (const m of version.modulos) {
          for (const l of m.lecciones) {
            if (l.tipo !== 'VIDEO') continue;
            const option = document.createElement('option');
            option.value = l.id;
            option.textContent = `${m.titulo} / ${l.titulo} (${l.estadoVideo})`;
            select.appendChild(option);
          }
        }
      }
      boton.disabled = !editable || !select.options.length;
      archivo.disabled = boton.disabled;
      select.disabled = boton.disabled;
      notificar(!editable ? 'Selecciona una version BORRADOR para subir videos.'
        : !select.options.length ? 'Primero crea una leccion de tipo VIDEO en esta version.'
        : 'Selecciona un MP4. Puedes reemplazar un video mientras su version siga en BORRADOR.');
    } catch (e) {
      notificar(e.message || 'No se pudo cargar la lista de lecciones.', true);
      boton.disabled = true;
    }
  }

  const abrirOriginal = window.AulaContenido.abrir;
  window.AulaContenido.abrir = async (c, refrescar) => {
    contexto = { curso: c, refrescar };
    const respuesta = await abrirOriginal(c, refrescar);
    await sincronizar();
    return respuesta;
  };
  versionControl.addEventListener('change', () => { void sincronizar(); });
  const arbol = document.getElementById('arbol-contenido');
  if (arbol) {
    let programado = false;
    new MutationObserver(() => {
      if (!contexto || programado || ocupado) return;
      programado = true;
      setTimeout(() => { programado = false; void sincronizar(); }, 100);
    }).observe(arbol, {childList:true, subtree:true});
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const cursoId = contexto?.curso?.id;
    const leccionId = select.value;
    const mp4 = archivo.files?.[0];
    if (!cursoId || !leccionId || !mp4) return notificar('Selecciona la leccion y el archivo MP4.',true);
    if (mp4.size > 200*1024*1024) return notificar('El MP4 supera los 200 MB.',true);
    ocupado = true; boton.disabled = true;
    notificar('Subiendo MP4 privado. No cierres la pagina durante la carga...');
    try {
      const fd = new FormData();
      fd.append('archivo', mp4);
      const resp = await window.AulaAdminFetch(
        `/api/demo/admin/videos/cursos/${encodeURIComponent(cursoId)}/lecciones/${encodeURIComponent(leccionId)}`,
        {method:'POST', body:fd});
      archivo.value = '';
      // Refresca el arbol y el estado de la leccion sin borrar otros cambios del editor.
      const anterior = versionControl.value;
      await abrirOriginal(contexto.curso, contexto.refrescar);
      if (Array.from(versionControl.options).some(o=>o.value===anterior)) {
        versionControl.value = anterior;
        versionControl.dispatchEvent(new Event('change'));
      }
      notificar('MP4 guardado. Leccion ' + resp.estadoVideo + '. Referencia: ' + resp.referencia);
    } catch (err) {
      notificar(err.message || 'No se pudo subir el MP4.',true);
    } finally {
      ocupado = false;
      boton.disabled = false;
      // La consulta reactualiza cuales lecciones pueden recibir videos.
    }
  });
})();
