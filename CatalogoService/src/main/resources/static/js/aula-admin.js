const $=id=>document.getElementById(id);
function mostrar(texto,error=false){$('mensaje').textContent=texto;$('mensaje').className='notice'+(error?' error':'');}
function celda(tr,valor){const td=document.createElement('td');td.textContent=valor;tr.appendChild(td);return td;}
function badge(estado){const s=document.createElement('span');s.className='badge '+estado;s.textContent=estado;return s;}
async function api(url,options={}){
 const method=(options.method||'GET').toUpperCase();
 const headers={...(options.headers||{})};
 if(!['GET','HEAD','OPTIONS','TRACE'].includes(method)){
  const token=document.querySelector('meta[name="_csrf"]')?.content;
  const header=document.querySelector('meta[name="_csrf_header"]')?.content||'X-CSRF-TOKEN';
  if(!token) throw new Error('Falta el token CSRF: recarga el panel como administrador.');
  headers[header]=token;
 }
 const r=await fetch(url,{...options,credentials:'same-origin',headers});
 const data=await r.json().catch(()=>({}));
 if(!r.ok) throw new Error(data.error||(r.status===403?'Acceso denegado o sesion caducada':'HTTP '+r.status));
 return data;
}
window.AulaAdminFetch=api;
async function cargar(){
 try{
  const compras=await api('/api/demo/panel/compras');
  const box=$('tabla');box.replaceChildren();
  if(!compras.length){box.textContent='No hay compras de demostracion.';mostrar('Sin compras pendientes.');return;}
  const t=document.createElement('table');const h=document.createElement('tr');
  for(const title of ['Estudiante','Curso','Monto','Compra','Acceso','Acciones']){const th=document.createElement('th');th.textContent=title;h.appendChild(th);}t.appendChild(h);
  for(const c of compras){
   const tr=document.createElement('tr');celda(tr,c.estudianteId);celda(tr,c.curso);celda(tr,c.moneda+' '+c.monto);
   celda(tr,'').append(badge(c.estado));celda(tr,'').append(badge(c.acceso));const td=celda(tr,'');const actions=document.createElement('div');actions.className='actions';
   const botones = c.estado==='PENDIENTE'?[['Aprobar','APROBADO',''],['Rechazar','RECHAZADO','danger']]:c.estado==='PAGADO'?[['Reembolsar','REEMBOLSADO','warn']]:[];
   for(const [label,valor,estilo] of botones){const btn=document.createElement('button');btn.textContent=label;if(estilo)btn.className=estilo;btn.onclick=()=>decidir(c.compraId,valor,btn);actions.append(btn);}
   if(!botones.length)actions.textContent='Sin acciones permitidas';td.append(actions);t.appendChild(tr);
  }
  box.appendChild(t);mostrar('Compras cargadas: '+compras.length+'. Los botones disponibles respetan el estado de cada compra.');
 }catch(e){mostrar(e.message,true);}
}
async function decidir(id,resultado,btn){
 if(!confirm('¿Confirmas la operacion DEMO: '+resultado+'?'))return;
 btn.disabled=true;
 try{const r=await api('/api/demo/panel/compras/'+encodeURIComponent(id)+'/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resultado})});
  await cargar();mostrar('Operacion aplicada: '+r.estadoCompra+'. Derecho de acceso: '+r.estadoAcceso+'.');
 }catch(e){mostrar('No se aplico la operacion: '+e.message,true);btn.disabled=false;}
}
$('cargar').onclick=cargar;
// La sesion ROLE_ADMIN reemplaza la clave DEMO. Cargar al abrir el panel.
cargar();
