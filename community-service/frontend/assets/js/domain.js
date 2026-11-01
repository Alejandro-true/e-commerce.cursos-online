export const STUDENT_ID = 42;
export const ADMIN_ID = 7;
export const courses = [
 {id:1,title:'Python desde cero',category:'Programación',teacher:'Diego Morales',icon:'code',color:'blue',lessons:8},
 {id:2,title:'Diseña interfaces memorables',category:'Diseño',teacher:'Valeria Ríos',icon:'layers',color:'lilac',lessons:6},
 {id:3,title:'Marketing que conecta',category:'Negocios',teacher:'Camila Vega',icon:'target',color:'peach',lessons:7},
 {id:4,title:'Domina tus bases de datos',category:'Tecnología',teacher:'Andrés López',icon:'database',color:'sage',lessons:9},
];
export const modules = [
 {id:1,name:'Tu primer paso',lesson:'Bienvenida a Python',course:1},
 {id:2,name:'Pensamiento lógico',lesson:'Variables y decisiones',course:1},
 {id:3,name:'Manos al código',lesson:'Funciones en Python',course:1},
 {id:4,name:'Ojo para el diseño',lesson:'Fundamentos de interfaces',course:2},
 {id:5,name:'De la idea al prototipo',lesson:'Wireframes y prototipos',course:2},
 {id:6,name:'Conecta con tu audiencia',lesson:'Estrategia de contenidos',course:3},
];
export function seedData(now=Date.now()) {
 const ago=(hours)=>new Date(now-hours*3600000).toISOString();
 const rows=[
  [101,1,201,5,'María Torres','Ahora sí entiendo Python. Los ejemplos son muy claros y pude crear mi primer programa desde el primer módulo.',2],
  [102,2,42,5,'Klissman','Me ayudó a ver las interfaces de otra manera. La parte de jerarquía visual vale muchísimo.',5],
  [103,1,202,4,'Diego Ramírez','Muy buen punto de partida. Me gustaría encontrar un par de ejercicios adicionales para practicar.',10],
  [104,3,203,5,'Lucía Mendoza','Directo, práctico y fácil de aplicar. Ya estoy usando lo aprendido en mi pequeño emprendimiento.',16],
  [105,1,42,5,'Klissman','Explicaciones sencillas y un ritmo perfecto para aprender a mi tiempo. ¡Recomendado!',23],
  [106,2,204,4,'Sofía Vargas','Los ejemplos visuales hacen toda la diferencia. Terminé con muchas ideas para mi próximo proyecto.',29],
  [107,4,205,5,'Mateo Salazar','Por fin las relaciones entre tablas tienen sentido. Me gustó mucho cómo conecta la teoría con la práctica.',35],
  [108,3,206,4,'Ana Castillo','Contenido muy útil para empezar a planificar una estrategia de comunicación con intención.',45],
  [109,2,207,2,'Carlos Rojas','Este comentario fue ocultado por incumplir las normas de convivencia.',50],
  [110,4,208,1,'Paula Díaz','Publicación promocional que no está relacionada con el curso.',70],
 ];
 return {version:1,reviews:rows.map(([id,curso_id,estudiante_id,calificacion,author,comentario,h])=>({id,curso_id,estudiante_id,calificacion,author,comentario,oculta:id>=109,creada_en:ago(h)})),
 rewards:[1,2,3].map((modulo_id,i)=>({id:i+1,estudiante_id:42,modulo_id,puntos:10,insignia:`MODULO_${modulo_id}_COMPLETADO`,otorgada_en:ago([168,72,24][i])})),
 audits:[{id:1,resena_id:109,administrador_id:7,motivo:'Lenguaje ofensivo. Se conserva el registro para su revisión.',moderada_en:ago(48)},{id:2,resena_id:110,administrador_id:7,motivo:'Contenido promocional ajeno al curso.',moderada_en:ago(68)}], events:[]};
}
export function validateReview(input) {
 const curso_id=Number(input.curso_id), calificacion=Number(input.calificacion);
 if(!Number.isSafeInteger(curso_id)||curso_id<1) throw new Error('Selecciona un curso válido.');
 if(!Number.isInteger(calificacion)||calificacion<1||calificacion>5) throw new Error('Selecciona una calificación del 1 al 5.');
 return {curso_id,calificacion,comentario:String(input.comentario||'').trim()||null};
}
export function addReview(data,input,now=new Date().toISOString()) {
 const fields=validateReview(input);
 const row={id:Math.max(0,...data.reviews.map(r=>r.id))+1,...fields,estudiante_id:42,author:'Klissman',oculta:false,creada_en:now};
 data.reviews.unshift(row); return row;
}
export function hideReview(data,id,motivo,now=new Date().toISOString()) {
 const row=data.reviews.find(r=>r.id===Number(id));
 if(!row) throw new Error('La reseña no existe.');
 if(row.oculta) throw new Error('Esta reseña ya está oculta.');
 if(!String(motivo).trim()) throw new Error('Escribe el motivo de la moderación.');
 const audit={id:Math.max(0,...data.audits.map(a=>a.id))+1,resena_id:row.id,administrador_id:7,motivo:String(motivo).trim(),moderada_en:now};
 row.oculta=true; data.audits.unshift(audit); return audit;
}
export function grantReward(data,studentId,moduleId,now=new Date().toISOString()) {
 const estudiante_id=Number(studentId), modulo_id=Number(moduleId);
 if(!Number.isSafeInteger(estudiante_id)||estudiante_id<1||!Number.isSafeInteger(modulo_id)||modulo_id<1) throw new Error('Los identificadores deben ser enteros positivos.');
 const existing=data.rewards.find(r=>r.estudiante_id===estudiante_id&&r.modulo_id===modulo_id);
 const reward=existing||{id:Math.max(0,...data.rewards.map(r=>r.id))+1,estudiante_id,modulo_id,puntos:10,insignia:`MODULO_${modulo_id}_COMPLETADO`,otorgada_en:now};
 if(!existing) data.rewards.unshift(reward);
 data.events.unshift({id:Math.max(0,...data.events.map(e=>e.id))+1,estudiante_id,modulo_id,created:!existing,created_at:now});
 return {reward,created:!existing};
}
export function achievements(data,studentId=42) {
 const rewards=data.rewards.filter(r=>r.estudiante_id===Number(studentId));
 return {estudiante_id:Number(studentId),puntos_totales:rewards.reduce((sum,r)=>sum+r.puntos,0),insignias:rewards};
}
export function ratingStats(reviews) {
 const visible=reviews.filter(r=>!r.oculta), distribution=[5,4,3,2,1].map(value=>({value,count:visible.filter(r=>r.calificacion===value).length}));
 return {count:visible.length,average:visible.length?visible.reduce((n,r)=>n+r.calificacion,0)/visible.length:0,distribution};
}
