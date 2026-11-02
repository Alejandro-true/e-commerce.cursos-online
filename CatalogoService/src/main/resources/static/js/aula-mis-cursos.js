const $=id=>document.getElementById(id);
async function pedir(url){const r=await fetch(url,{credentials:'same-origin'});
 if(r.status===401){window.location.href='/ingresar';throw new Error('Debes iniciar sesión');}
 if(!r.ok)throw new Error('No se pudo consultar: HTTP '+r.status);
 return r.json();}
async function cargar(){
 const msg=$('mensaje'),panel=$('cursos');panel.replaceChildren();msg.className='notice';msg.textContent='Consultando...';
 try{
  const [cuenta,datos]=await Promise.all([pedir('/api/demo/cuenta/yo'),pedir('/api/demo/cuenta/mis-cursos')]);
  $('identidad').textContent='Estudiante: '+cuenta.nombre+' ('+cuenta.email+')';
  if(!datos.length){msg.textContent='Todavía no tienes cursos con acceso ACTIVO. Solicita una compra y espera su aprobación.';return;}
  msg.textContent='Cursos con acceso activo: '+datos.length;
  for(const c of datos){const art=document.createElement('article');art.className='card';
   const h=document.createElement('h3');h.textContent=c.titulo;
   const p=document.createElement('p');p.textContent='Versión adquirida: '+c.numeroVersion;
   const b=document.createElement('span');b.className='badge ACTIVO';b.textContent='ACTIVO';
   const note=document.createElement('p');note.className='muted';note.textContent='Video pendiente de integrar en RF07.';
   art.append(h,p,b,note);panel.appendChild(art);
  }
 }catch(e){msg.className='notice error';msg.textContent=e.message;}
}
$('refrescar').onclick=cargar;cargar();
