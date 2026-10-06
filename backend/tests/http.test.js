import {test} from 'node:test';
import assert from 'node:assert/strict';
import {app} from '../src/app.js';
import {pool} from '../src/config/database.js';

test('HTTP: acesso, validação e CORS antes da persistência',async t=>{
 const server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s))});
 const base=`http://127.0.0.1:${server.address().port}`;
 try{
  for(const [name,path,options,status] of [
   ['Rota protegida sem token','/api/v1/servicos/meus',{},401],
   ['Token inválido','/api/v1/servicos/meus',{headers:{Authorization:'Bearer invalido'}},401],
   ['Cadastro incompleto','/api/v1/auth/cadastro',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nome:'A'})},400],
   ['Login inválido','/api/v1/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'errado',senha:''})},400],
   ['Identificador inválido','/api/v1/prestadores/abc',{},400],
   ['Busca com paginação inválida','/api/v1/prestadores?page=abc',{},400],
   ['Rota inexistente','/api/v1/inexistente',{},404],
  ]){await t.test(name,async()=>{const r=await fetch(base+path,options);assert.equal(r.status,status);const d=await r.json();assert.ok(d.erro.mensagem);assert.ok(d.erro.requestId);})}
  await t.test('Preflight da origem autorizada',async()=>{const r=await fetch(base+'/api/v1/servicos',{method:'OPTIONS',headers:{Origin:'http://localhost:5173','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'authorization,content-type'}});assert.equal(r.status,204);assert.equal(r.headers.get('access-control-allow-origin'),'http://localhost:5173');});
 }finally{await new Promise(resolve=>server.close(resolve));await pool.end()}
});
