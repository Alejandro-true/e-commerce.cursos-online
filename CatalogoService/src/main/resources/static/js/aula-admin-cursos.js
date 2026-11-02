/* Etapa 10.1. Solo perfil DEMO. Reutiliza el campo de clave del panel de compras. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const raiz = '/api/demo/admin/cursos';
  let cursos = [];
  let categorias = [];

  async function apiCursos(path = '', opciones = {}) {
    return window.AulaAdminFetch(raiz + path, opciones);
  }
  function aviso(texto, error = false) {
    const bloque = el('mensaje-cursos');
    bloque.textContent = texto;
    bloque.className = 'notice' + (error ? ' error' : '');
  }

  function mostrarSeccion(seccion) {
    const enCursos = seccion === 'cursos';
    el('seccion-compras').hidden = enCursos;
    el('seccion-cursos').hidden = !enCursos;
    el('tab-cursos').className = enCursos ? '' : 'secondary';
    el('tab-compras').className = enCursos ? 'secondary' : '';
    el('tab-cursos').setAttribute('aria-pressed', String(enCursos));
    el('tab-compras').setAttribute('aria-pressed', String(!enCursos));
    if (enCursos) cargarCursos();
  }

  function td(fila, texto) {
    const celda = document.createElement('td');
    celda.textContent = texto == null ? '—' : String(texto);
    fila.append(celda);
    return celda;
  }

  async function cargarCursos() {
    try {
      [cursos, categorias] = await Promise.all([apiCursos(), apiCursos('/categorias')]);
      const caja = el('tabla-cursos');
      caja.replaceChildren();
      if (!cursos.length) {
        caja.textContent = 'Todavia no hay cursos. Utiliza Nuevo curso para crear un borrador.';
      } else {
        const tabla = document.createElement('table');
        const tr = document.createElement('tr');
        ['Curso', 'Categoria', 'Nivel', 'Precio base', 'Estado', 'Acciones'].forEach(t => {
          const th = document.createElement('th'); th.textContent = t; tr.append(th);
        });
        tabla.append(tr);
        cursos.forEach(c => {
          const fila = document.createElement('tr');
          td(fila, c.titulo);
          td(fila, c.categoria);
          td(fila, c.nivel);
          td(fila, c.precioBase == null ? 'Sin precio' : `${c.moneda} ${Number(c.precioBase).toFixed(2)}`);
          const estado = td(fila, '');
          const badge = document.createElement('span');
          badge.textContent = c.estado;
          badge.className = 'badge ' + c.estado;
          estado.append(badge);
          const acciones = td(fila, '');
          const gestionar = document.createElement('button');
          gestionar.className = 'secondary'; gestionar.textContent = 'Gestionar contenido';
          gestionar.addEventListener('click', () => {
            if (window.AulaContenido) window.AulaContenido.abrir(c, cargarCursos);
          });
          acciones.append(gestionar);
          if (c.estado === 'BORRADOR') {
            const b = document.createElement('button');
            b.className = 'secondary'; b.textContent = 'Editar'; b.style.marginLeft = '6px';
            b.addEventListener('click', () => abrirModal(c));
            acciones.append(b);
          } else {
            acciones.textContent = 'Solo lectura';
          }
          tabla.append(fila);
        });
        caja.append(tabla);
      }
      aviso(`Cursos cargados: ${cursos.length}. Se permite editar solo BORRADOR.`);
    } catch (e) { aviso(e.message, true); }
  }

  function rellenarCategorias(actual) {
    const select = el('curso-categoria'); select.replaceChildren();
    categorias.forEach(c => {
      const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.nombre;
      select.append(opt);
    });
    if (actual) select.value = actual;
  }

  function abrirModal(curso = null) {
    if (!categorias.length) { aviso('No hay categorias activas. Crea una categoria antes de registrar cursos.', true); return; }
    el('form-curso').reset();
    el('curso-id').value = curso ? curso.id : '';
    el('titulo-modal-curso').textContent = curso ? 'Editar borrador' : 'Crear nuevo curso';
    el('guardar-curso').textContent = curso ? 'Guardar cambios' : 'Guardar borrador';
    rellenarCategorias(curso?.categoriaId);
    if (curso) {
      el('curso-titulo').value = curso.titulo ?? '';
      el('curso-slug').value = curso.slug ?? '';
      el('curso-descripcion').value = curso.descripcion ?? '';
      el('curso-nivel').value = curso.nivel;
      el('curso-precio').value = curso.precioBase ?? '';
      el('curso-moneda').value = curso.moneda ?? 'PEN';
      el('curso-miniatura').value = curso.miniaturaUrl ?? '';
    }
    el('error-modal-curso').hidden = true;
    el('modal-curso').showModal();
    el('curso-titulo').focus();
  }

  const slugDesdeTitulo = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180);

  async function guardar(evento) {
    evento.preventDefault();
    const id = el('curso-id').value;
    const datos = {
      categoriaId: el('curso-categoria').value,
      titulo: el('curso-titulo').value.trim(),
      slug: el('curso-slug').value.trim(),
      descripcion: el('curso-descripcion').value.trim(),
      nivel: el('curso-nivel').value,
      miniaturaUrl: el('curso-miniatura').value.trim() || null,
      precioBase: Number(el('curso-precio').value),
      moneda: el('curso-moneda').value
    };
    const boton = el('guardar-curso'); boton.disabled = true;
    try {
      const ruta = id ? '/' + encodeURIComponent(id) : '';
      await apiCursos(ruta, {
        method: id ? 'PUT' : 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(datos)
      });
      el('modal-curso').close();
      await cargarCursos();
      aviso(id ? 'Borrador actualizado correctamente.' : 'Curso creado como BORRADOR. El contenido se gestionara en la etapa 10.2.');
    } catch (e) {
      el('error-modal-curso').textContent = e.message;
      el('error-modal-curso').hidden = false;
    } finally { boton.disabled = false; }
  }

  el('tab-compras').addEventListener('click', () => mostrarSeccion('compras'));
  el('tab-cursos').addEventListener('click', () => mostrarSeccion('cursos'));
  el('nuevo-curso').addEventListener('click', () => abrirModal());
  el('cerrar-curso').addEventListener('click', () => el('modal-curso').close());
  el('cancelar-curso').addEventListener('click', () => el('modal-curso').close());
  el('form-curso').addEventListener('submit', guardar);
  el('curso-titulo').addEventListener('input', () => {
    if (!el('curso-id').value) el('curso-slug').value = slugDesdeTitulo(el('curso-titulo').value);
  });
})();
