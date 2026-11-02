const $=id=>document.getElementById(id);
const clave=()=> $('clave').value;
function mostrar(texto,error=false){$('mensaje').textContent=texto;$('mensaje').className='notice'+(error?' error':'');}
function celda(tr,valor){const td=document.createElement('td');td.textContent=valor;tr.appendChild(td);return td;}
function badge(estado){const s=document.createElement('span');s.className='badge '+estado;s.textContent=estado;return s;}
async function api(url,options={}){ const r=await fetch(url,{...options,headers:{...(options.headers||{}),'X-Demo-Key':clave()}});let data;try{data=await r.json();}catch{data={error:'Respuesta no valida'};}if(!r.ok)throw new Error(data.error||'HTTP '+r.status);return data;}
async function cargar(){
 if(!clave()){mostrar('Introduce primero la clave DEMO.',true);return;}
 try{
  const compras=await api('/api/demo/panel/compras');
  const box=$('tabla');box.replaceChildren();
  if(!compras.length){box.textContent='No hay compras de demostracion.';mostrar('Sin compras pendientes.');return;}
  const t=document.createElement('table');const h=document.createElement('tr');
  for(const title of ['Estudiante','Curso','Monto','Compra','Acceso','Acciones']){const th=document.createElement('th');th.textContent=title;h.appendChild(th);}t.appendChild(h);
  for(const c of compras){
   const tr=document.createElement('tr');celda(tr,c.estudianteId);celda(tr,c.curso);celda(tr,c.moneda+' '+c.monto);
   celda(tr,'').append(badge(c.estado));celda(tr,'').append(badge(c.acceso));const td=celda(tr,'');const actions=document.createElement('div');actions.className='actions';
   const yaAdquirido=compras.some(otra=>otra.compraId!==c.compraId && otra.estudianteId===c.estudianteId && otra.cursoId===c.cursoId && otra.acceso==='ACTIVO');
   const botones = c.estado==='PENDIENTE'
      ? (yaAdquirido ? [['Rechazar duplicada','RECHAZADO','danger']] : [['Aprobar','APROBADO',''],['Rechazar','RECHAZADO','danger']])
      : c.estado==='PAGADO'?[['Reembolsar','REEMBOLSADO','warn']]:[];
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
$('clave').addEventListener('keydown',e=>{if(e.key==='Enter')cargar();});
