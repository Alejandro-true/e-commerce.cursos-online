import assert from 'node:assert/strict';
import {seedData,grantReward} from '../assets/js/domain.js';
import {e,activityRows} from '../assets/js/ui.js';
import {dashboard} from '../assets/js/views/dashboard.js';
import {reviews} from '../assets/js/views/reviews.js';
import {moderation} from '../assets/js/views/moderation.js';
import {achievementsView} from '../assets/js/views/achievements.js';
import {activity} from '../assets/js/views/activity.js';
import {connection} from '../assets/js/views/connection.js';
const fixture=()=>({mode:'demo',role:'student',data:seedData(),course:'all',scope:'all',rating:'all',sort:'recent',search:'',modStatus:'visible',activityType:'all',busy:false,baseUrl:'',authorization:'',api:{reviews:[],achievements:null,audits:[],activity:[],health:null,database:null,reviewError:null,achievementError:null,checked:false,loadedReviews:false}});
let count=0;
function test(name,fn){fn();count++;process.stdout.write(`✓ ${name}\n`);}
for(const [name,view] of Object.entries({dashboard,reviews,moderation,achievementsView,activity,connection})){
 test(`${name}: muestra la demostración`,()=>{const html=view(fixture());assert.ok(html.includes('<'));assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));});
 test(`${name}: admite el modo API vacío`,()=>{const state=fixture();state.mode='api';state.course=1;const html=view(state);assert.ok(html.includes('<'));assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));});
}
test('escapa texto de reseñas y atributos',()=>{assert.equal(e('<img src=x onerror="x">'), '&lt;img src=x onerror=&quot;x&quot;&gt;');const s=fixture();s.data.reviews[0].comentario='<script>alert(1)</script>';const html=reviews(s);assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));});
test('el error de la API no muestra insignias ficticias',()=>{const s=fixture();s.mode='api';s.api.achievementError={status:503,message:'Autenticación pendiente'};const html=achievementsView(s);assert.ok(html.includes('La integración está pendiente'));assert.ok(!html.includes('30</strong>'));assert.ok(!html.includes('Tu primer paso'));});
test('un premio nuevo produce una actividad y el reintento conserva puntos',()=>{const s=fixture();const before=activityRows(s).length;grantReward(s.data,42,4);assert.equal(activityRows(s).length,before+1);grantReward(s.data,42,4);assert.equal(activityRows(s).length,before+2);assert.ok(activityRows(s).some(x=>x.title.includes('sin duplicar')));});
test('mis reseñas solo muestra la identidad de demostración',()=>{const s=fixture();s.scope='mine';const html=reviews(s);assert.ok(html.includes('Klissman'));assert.ok(!html.includes('María Torres'));});
process.stdout.write(`\n${count} comprobaciones de vistas correctas.\n`);
