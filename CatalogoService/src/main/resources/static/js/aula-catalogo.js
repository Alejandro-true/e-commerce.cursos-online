// Etapa 11.3: las compras y los accesos NUNCA reciben estudianteId del navegador.
const basePublico='/api/demo/portal';
const baseCuenta='/api/demo/cuenta';
const $=id=>document.getElementById(id);
let identidad=null;
let comprasActuales=[];
const cursoPendiente=(()=>{try { return sessionStorage.getItem('aulabreve-curso-pendiente'); }catch{return null;}})();

function mensaje(texto,error=false){$('mensaje').textContent=texto;$('mensaje').className='notice'+(error?' error':'');}
function celda(tr,valor){const td=document.createElement('td');td.textContent=valor;tr.appendChild(td);return td;}
function badge(texto){const e=document.createElement('span');e.className='badge '+texto;e.textContent=texto;return e;}
async function pedir(url,opciones={}){
 const r=await fetch(url,{credentials:'same-origin',...opciones});
 let d;try{d=await r.json();}catch{d={error:r.status===401?'Debes iniciar sesión':'Respuesta inesperada del servidor'};}
 if(!r.ok)throw new Error(d.error||d.detail||'Error HTTP '+r.status);
 return d;
}
function csrfHeaders(){
 const token=document.querySelector('meta[name="_csrf"]')?.content;
 const header=document.querySelector('meta[name="_csrf_header"]')?.content;
 if(!token||!header)throw new Error('Falta el token CSRF. Actualiza la página.');
 return {'Content-Type':'application/json',[header]:token};
}
async function cargarIdentidad(){
 try{
  identidad=await pedir(baseCuenta+'/yo');
  $('sesion').textContent='Has iniciado sesión como '+identidad.nombre+' ('+identidad.email+').';
  $('seccion-compras').hidden=false;
 }catch(e){
  identidad=null;
  $('sesion').replaceChildren();
  const texto=document.createElement('span');texto.textContent='Puedes consultar libremente. Para comprar, ';
  const link=document.createElement('a');link.href='/ingresar';link.textContent='inicia sesión';
  const text2=document.createTextNode(' o ');
  const reg=document.createElement('a');reg.href='/registro';reg.textContent='crea una cuenta';
  $('sesion').append(texto,link,text2,reg,document.createTextNode('.'));
  $('seccion-compras').hidden=true;
 }
}
async function cargarCompras(){
 if(!identidad){comprasActuales=[];return;}
 const registros=await pedir(baseCuenta+'/compras');
 comprasActuales=registros;
 const box=$('mis-compras');box.replaceChildren();
 if(!registros.length){box.textContent='Aún no existen solicitudes de compra.';return;}
 const t=document.createElement('table'),head=document.createElement('tr');
 for(const txt of ['Curso','Monto','Estado compra','Acceso']){const th=document.createElement('th');th.textContent=txt;head.appendChild(th);}t.appendChild(head);
 for(const r of registros){const tr=document.createElement('tr');celda(tr,r.curso);celda(tr,r.moneda+' '+r.monto);
  let td=celda(tr,'');td.append(badge(r.estado));td=celda(tr,'');td.append(badge(r.acceso));t.appendChild(tr);}
 box.appendChild(t);
}
async function cargarCatalogo(){
 try{
  const q=$('buscar').value.trim();
  const lista=await pedir(basePublico+'/cursos'+(q?'?texto='+encodeURIComponent(q):''));
  const panel=$('cursos');panel.replaceChildren();
  if(!lista.length){mensaje('No hay cursos publicados con ese filtro.');return;}
  const queryElegido=new URLSearchParams(window.location.search).get('comprar');
  for(const curso of lista){
   const art=document.createElement('article');art.className='card';
   if(curso.id===queryElegido){art.style.borderColor='#195da5';art.style.borderWidth='2px';}
   const cat=document.createElement('div');cat.className='muted';cat.textContent=curso.categoria?.nombre||'Curso';
   const h=document.createElement('h3');h.textContent=curso.titulo;
   const p=document.createElement('p');p.textContent=(curso.descripcion||'').slice(0,180);
   const price=document.createElement('div');price.className='price';price.textContent=(curso.precio?.moneda||'PEN')+' '+(curso.precio?.precioFinal||'—');
   const row=document.createElement('div');row.className='row';
   const info=document.createElement('button');info.className='secondary';info.textContent='Ver detalle';info.onclick=()=>detalle(curso.id);
   const btn=document.createElement('button');
   const delCurso=comprasActuales.filter(c=>c.cursoId===curso.id);
   if(delCurso.some(c=>c.acceso==='ACTIVO')){btn.textContent='Ya tienes este curso';btn.disabled=true;}
   else if(delCurso.some(c=>c.estado==='PENDIENTE')){btn.textContent='Solicitud pendiente';btn.disabled=true;}
   else{btn.textContent=identidad?'Solicitar compra':'Regístrate para comprar';btn.onclick=()=>comprar(curso.id,btn);}
   row.append(info,btn);art.append(cat,h,p,price,row);panel.appendChild(art);
  }
  mensaje(queryElegido&&identidad?'Ya iniciaste sesión. Confirma la compra del curso seleccionado con el botón «Solicitar compra».':'Catálogo listo. Puedes explorar los cursos publicados.');
 }catch(e){mensaje(e.message,true);}
}
async function detalle(id){
 try{const d=await pedir(basePublico+'/cursos/'+encodeURIComponent(id));
  const modulos=(d.modulos||[]).map(m=>m.titulo+' ('+(m.lecciones?.length||0)+' lecciones)').join(', ');
  mensaje('Curso: '+d.titulo+'\nVersión: '+d.numeroVersion+'\nMódulos: '+(modulos||'Sin módulos'));
 }catch(e){mensaje(e.message,true);}
}
async function comprar(cursoId,btn){
 if(!identidad){
  try{sessionStorage.setItem('aulabreve-curso-pendiente',cursoId);}catch{}
  window.location.href='/registro';return;
 }
 btn.disabled=true;
 try{
  const d=await pedir(baseCuenta+'/compras',{
   method:'POST',headers:csrfHeaders(),body:JSON.stringify({cursoId})
  });
  try{sessionStorage.removeItem('aulabreve-curso-pendiente');}catch{}
  await cargarCompras();await cargarCatalogo();
  mensaje('Compra registrada: '+d.compraId+'\nEstado: '+d.estado+'\nEl administrador debe confirmar el pago DEMO.');
 }catch(e){mensaje('No se pudo crear la compra: '+e.message,true);}
 finally{btn.disabled=false;}
}
async function actualizar(){try{await cargarIdentidad();await cargarCompras();await cargarCatalogo();}catch(e){mensaje(e.message,true);}}
$('btn-buscar').onclick=cargarCatalogo;
$('actualizar').onclick=actualizar;
actualizar();
