import assert from 'node:assert/strict';
import {seedData,addReview,hideReview,grantReward,achievements,ratingStats,validateReview} from '../assets/js/domain.js';
let count=0;
function test(name,fn){fn();count++;process.stdout.write(`✓ ${name}\n`);}
test('crea reseña con calificación y comentario opcional',()=>{const d=seedData();const r=addReview(d,{curso_id:1,calificacion:5});assert.equal(r.comentario,null);assert.equal(r.estudiante_id,42);assert.equal(r.oculta,false);});
test('rechaza puntuaciones fuera del rango',()=>{assert.throws(()=>validateReview({curso_id:1,calificacion:0}));assert.throws(()=>validateReview({curso_id:1,calificacion:6}));});
test('ocultar conserva reseña y crea auditoría',()=>{const d=seedData();const n=d.audits.length;const a=hideReview(d,101,'  Motivo válido  ');assert.equal(d.reviews.find(r=>r.id===101).oculta,true);assert.equal(a.administrador_id,7);assert.equal(a.motivo,'Motivo válido');assert.equal(d.audits.length,n+1);});
test('no duplica auditorías ni admite motivos vacíos',()=>{const d=seedData();assert.throws(()=>hideReview(d,101,' '));hideReview(d,101,'Motivo');const n=d.audits.length;assert.throws(()=>hideReview(d,101,'Otro'));assert.equal(d.audits.length,n);});
test('recompensa módulo una sola vez',()=>{const d=seedData();const n=achievements(d).puntos_totales;const a=grantReward(d,42,4);const b=grantReward(d,42,4);assert.equal(a.created,true);assert.equal(b.created,false);assert.equal(a.reward.id,b.reward.id);assert.equal(achievements(d).puntos_totales,n+10);});
test('aísla puntos de cada estudiante',()=>{const d=seedData();grantReward(d,99,4);assert.equal(achievements(d,99).puntos_totales,10);assert.equal(achievements(d,42).puntos_totales,30);});
test('estadísticas excluyen reseñas ocultas',()=>{const d=seedData();assert.equal(ratingStats(d.reviews).count,8);hideReview(d,101,'Motivo');assert.equal(ratingStats(d.reviews).count,7);});
test('datos vacíos muestran cero puntos',()=>assert.equal(achievements({rewards:[]},42).puntos_totales,0));
process.stdout.write(`\n${count} comprobaciones correctas.\n`);
