export class ApiError extends Error {constructor(message,status=0){super(message);this.status=status;}}
let baseUrl='',authorization='';
export function configureApi(base='',auth='') {
 const value=base.trim().replace(/\/+$/,'');
 if(value){const parsed=new URL(value);if(!['http:','https:'].includes(parsed.protocol))throw new Error('Usa una dirección http o https.');}
 baseUrl=value;authorization=auth.trim();
}
export async function request(path,options={}) {
 const target=(baseUrl||location.origin)+path;
 const url=new URL(target);
 if(location.protocol==='https:'&&url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)) throw new ApiError('Para conectar tu API local, abre la copia del panel desde FastAPI. Encontrarás los pasos en INTEGRACION.md.');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
 try {
  const res=await fetch(target,{...options,signal:controller.signal,headers:{Accept:'application/json',...(options.body?{'Content-Type':'application/json'}:{}),...(authorization?{Authorization:authorization}:{}),...options.headers}});
  const raw=await res.text();let body;try{body=JSON.parse(raw);}catch{throw new ApiError('La dirección no devolvió una respuesta JSON de FastAPI. Revisa la conexión.',res.status);}
  if(!res.ok){const msg=typeof body.detail==='string'?body.detail:res.status===422?'Revisa los datos enviados.':`La API respondió con estado ${res.status}.`;throw new ApiError(msg,res.status);}
  return body;
 } catch(err){if(err instanceof ApiError)throw err;throw new ApiError(err.name==='AbortError'?'La API está tardando demasiado en responder.':'No se pudo conectar con la API. Revisa la dirección y cómo se sirve el panel.');}
 finally{clearTimeout(timer);}
}
export const api={
 health:()=>request('/health'), database:()=>request('/health/db'),
 reviews:(course)=>request(`/resenas?curso_id=${Number(course)}&limit=100&offset=0`),
 createReview:(data)=>request('/resenas',{method:'POST',body:JSON.stringify(data)}),
 hideReview:(id,motivo)=>request(`/resenas/${Number(id)}/ocultar`,{method:'PATCH',body:JSON.stringify({motivo})}),
 achievements:()=>request('/logros/me'),
};
