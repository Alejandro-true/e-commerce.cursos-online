(() => {
  'use strict';
  const el = id => document.getElementById(id);
  let curso = null;
  let contenido = null;
  let refrescarCursos = null;
  let ultimaVersion = null;
  const root = '/api/demo/admin/contenido';

  async function api(ruta, opciones = {}) {
    const clave = el('clave').value;
    if (!clave) throw new Error('Introduce la clave DEMO del administrador.');
    const r = await fetch(root + ruta, {
      ...opciones,
      headers: {'X-Demo-Key':clave, ...(opciones.headers||{})}
    });
    const json = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(json.error || `Error HTTP ${r.status}`);
    return json;
  }
  function aviso(mensaje,error=false){
    const caja=el('contenido-mensaje'); caja.textContent=mensaje;
    caja.className='notice'+(error?' error':'');
  }
  function option(select,id,texto) {
    const o=document.createElement('option');o.value=id;o.textContent=texto; select.append(o);
  }
  function fila(contenedor, clase, texto) {
    const d=document.createElement('div');d.className=clase;d.textContent=texto;contenedor.append(d);return d;
  }
  function versionSeleccionada(){
    return contenido?.versiones.find(v=>v.id===el('version-elegida').value);
  }
  function sugerirOrdenLeccion() {
    const moduloId = el('leccion-modulo').value;
    const version = versionSeleccionada();

    const modulo = version?.modulos.find(
        m => m.id === moduloId
    );

    const ocupados = new Set(
        (modulo?.lecciones || []).map(l => Number(l.orden))
    );

    let siguiente = 1;

    while (ocupados.has(siguiente)) {
        siguiente++;
    }

    el('form-leccion').elements.orden.value = siguiente;
}
  function habilitarEdicion() {
    const v=versionSeleccionada();
    const editable=v?.estado==='BORRADOR' && contenido.estado!=='ARCHIVADO';
    ['form-modulo','form-leccion','form-recurso'].forEach(id=>{
      el(id).querySelectorAll('input,textarea,select,button').forEach(c=>c.disabled=!editable);
    });
    el('form-version').querySelectorAll('input,button').forEach(c=>c.disabled=contenido.estado==='ARCHIVADO');
    el('publicar-version').disabled=!editable;
    el('archivar-curso').disabled=contenido.estado==='ARCHIVADO';
    const sm=el('leccion-modulo');sm.replaceChildren();
    const sl=el('recurso-leccion');sl.replaceChildren();
    if(v) for(const m of v.modulos){
      option(sm,m.id,`${m.orden}. ${m.titulo}`);
      for(const l of m.lecciones)option(sl,l.id,`${m.titulo} / ${l.titulo}`);
    }
    if(!sm.options.length)el('form-leccion').querySelector('button').disabled=true;
    if(!sl.options.length)el('form-recurso').querySelector('button').disabled=true;
    sugerirOrdenLeccion();
  }
  function dibujar() {
    el('contenido-titulo').textContent='Contenido: '+contenido.titulo;
    el('contenido-estado').textContent='Estado del curso: '+contenido.estado;
    const lista=el('arbol-contenido');lista.replaceChildren();
    if(!contenido.versiones.length)fila(lista,'muted','No hay versiones. Crea una version BORRADOR.');
    const select=el('version-elegida');select.replaceChildren();
    for(const v of contenido.versiones){
      option(select,v.id,`${v.numeroVersion} — ${v.estado}${v.ofertada?' (ofertada)':''}`);
      const caja=fila(lista,'editor-version',`Version ${v.numeroVersion} — ${v.estado}${v.ofertada?' · OFERTADA':''}`);
      if(!v.modulos.length)fila(caja,'muted','Aun no hay modulos.');
      for(const m of v.modulos){
        const md=fila(caja,'editor-modulo',`Modulo ${m.orden}: ${m.titulo}`);
        for(const l of m.lecciones){
          const ld=fila(md,'editor-leccion',`Leccion ${l.orden}: ${l.titulo} (${l.tipo}${l.tipo==='VIDEO'?' / '+l.estadoVideo:''}${l.obligatorio?' / obligatoria':''})`);
          for(const r of l.recursos) fila(ld,'editor-recurso',`Recurso: ${r.nombre} (${r.tipoArchivo})`);
        }
      }
    }
    const elegida=contenido.versiones.find(v=>v.id===ultimaVersion);
    if(elegida)select.value=elegida.id;
    else if(contenido.versiones.length)select.value=contenido.versiones[contenido.versiones.length-1].id;
    ultimaVersion=select.value;
    habilitarEdicion();
  }
  async function actualizar(){
    contenido=await api('/'+encodeURIComponent(curso.id));
    dibujar();
  }
  async function ejecutar(funcion,mensaje){
    try { await funcion(); await actualizar(); aviso(mensaje); }
    catch(e){aviso(e.message,true);}
  }
  function json(form){const f=new FormData(form);return Object.fromEntries(f.entries());}
  async function enviar(path,datos){
    return api(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(datos)});
  }
  const ruta=()=>'/'+encodeURIComponent(curso.id);
  el('version-elegida').addEventListener('change',()=>{ultimaVersion=el('version-elegida').value;habilitarEdicion();});
  el('volver-contenido').addEventListener('click',async()=>{
    el('seccion-contenido').hidden=true; el('seccion-cursos').hidden=false;
    if(refrescarCursos) await refrescarCursos();
  });
  el('form-version').addEventListener('submit',e=>{
    e.preventDefault();const f=e.currentTarget;
    ejecutar(async()=>{ const r=await enviar(ruta()+'/versiones',json(f));ultimaVersion=r.id; f.reset(); },'Version creada. Anade modulos y lecciones.');
  });
  el('form-modulo').addEventListener('submit',e=>{
    e.preventDefault();const f=e.currentTarget; const v=versionSeleccionada();if(!v)return;
    ejecutar(async()=>{await enviar(ruta()+'/versiones/'+v.id+'/modulos',{
      ...json(f),orden:Number(new FormData(f).get('orden'))
    });f.reset();},'Modulo creado.');
  });
  el('form-leccion').addEventListener('submit',e=>{
    e.preventDefault(); const f=e.currentTarget; const d=json(f);const tipo=d.tipo;
    if(!el('leccion-modulo').value)return aviso('Selecciona un modulo.',true);
    ejecutar(async()=>{ await enviar(ruta()+'/modulos/'+el('leccion-modulo').value+'/lecciones',{
      titulo:d.titulo,descripcion:d.descripcion||null,tipo,
      contenidoTexto:d.contenidoTexto||null,
      videoReferencia:tipo==='LECTURA'?null:(d.videoReferencia||null),
      estadoVideo:tipo==='LECTURA'?'NO_APLICA':d.estadoVideo,
      duracionSegundos:d.duracionSegundos===''?null:Number(d.duracionSegundos),
      obligatorio:!!f.elements.obligatorio.checked,
      orden:Number(d.orden)
    });f.reset();},'Leccion creada.');
  });
  el('form-recurso').addEventListener('submit',e=>{
    e.preventDefault();const f=e.currentTarget;const id=el('recurso-leccion').value;
    if(!id)return aviso('Selecciona una leccion.',true);
    ejecutar(async()=>{await enviar(ruta()+'/lecciones/'+id+'/recursos',json(f));f.reset();},'Recurso agregado.');
  });
  el('publicar-version').addEventListener('click',()=>{
    const v=versionSeleccionada();if(!v || !confirm(`Publicar la version ${v.numeroVersion}? El contenido quedara inmutable.`))return;
    ejecutar(()=>enviar(ruta()+'/versiones/'+v.id+'/publicar',{}),'Version publicada. El curso ya puede aparecer en el catalogo.');
  });
  el('archivar-curso').addEventListener('click',()=>{
    if(!confirm('Archivar el curso? Dejara de aparecer en el catalogo. Las compras y derechos historicos se conservan.'))return;
    ejecutar(()=>enviar(ruta()+'/archivar',{}),'Curso archivado.');
  });
  el('leccion-tipo').addEventListener('change',()=>{
    const lectura=el('leccion-tipo').value==='LECTURA';
    const f=el('form-leccion');
    f.elements.videoReferencia.disabled=lectura;
    f.elements.estadoVideo.disabled=lectura;
    f.elements.duracionSegundos.disabled=lectura;
  });
  el('leccion-modulo').addEventListener(
    'change',
    sugerirOrdenLeccion
  );
  window.AulaContenido={abrir:async(c,refrescar)=>{
    curso=c;refrescarCursos=refrescar;ultimaVersion=null;
    el('seccion-cursos').hidden=true;el('seccion-contenido').hidden=false;
    try{await actualizar();aviso('Selecciona una version para agregar contenido.');}
    catch(e){aviso(e.message,true);}
  }};
})();
