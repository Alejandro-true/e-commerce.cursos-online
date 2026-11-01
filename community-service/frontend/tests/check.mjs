import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../', import.meta.url)));
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
function files(root){return readdirSync(root,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(resolve(root,entry.name)):[resolve(root,entry.name)]);}
let n=0;
for(const path of files('assets').filter(p=>p.endsWith('.js'))){const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status)throw new Error(result.stderr);const text=readFileSync(path,'utf8');for(const match of text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){if(match[1].startsWith('.')&&!existsSync(resolve(dirname(path),match[1])))throw new Error(`Import no encontrado: ${path} -> ${match[1]}`);}n++;}
const html=readFileSync('index.html','utf8');for(const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)){if(!existsSync(resolve('.',match[1])))throw new Error(`Recurso no encontrado: ${match[1]}`);}
console.log(`${n} módulos y recursos estáticos verificados.`);
for(const file of ['tests/domain.test.mjs','tests/views.test.mjs']){const result=spawnSync(process.execPath,[file],{stdio:'inherit'});if(result.status)process.exit(result.status||1);}
