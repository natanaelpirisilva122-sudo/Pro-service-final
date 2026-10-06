import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {app} from '../src/app.js';
import {pool} from '../src/config/database.js';

// Usa o MySQL configurado em .env. Não simula repositórios ou banco.
test('Fluxo real: cadastro, login, perfil, busca, solicitação, conclusão e avaliação', async t => {
 const tag=randomUUID(); const emails=[]; const checks=[];
 let server;
 try {
  await pool.query('SELECT 1');
  server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s))});
  const base=`http://127.0.0.1:${server.address().port}/api/v1`;
  async function request(path,method='GET',body,token,expected=200){
   const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
   const data=await r.json(); assert.equal(r.status,expected,`${method} ${path}: ${JSON.stringify(data)}`); return data;
  }
  async function register(tipo,label){const email=`fase2-${label}-${tag}@example.test`;emails.push(email);return request('/auth/cadastro','POST',{nome:`Teste ${label}`,email,senha:'SenhaTeste#2026',tipo},null,201)}
  const client=await register('CLIENTE','cliente'); const provider=await register('PRESTADOR','prestador'); const outsider=await register('CLIENTE','terceiro');
  const login=await request('/auth/login','POST',{email:emails[0],senha:'SenhaTeste#2026'});assert.equal(login.usuario.id,client.usuario.id);checks.push('Cadastro e login reais');
  await request('/auth/login','POST',{email:emails[0],senha:'SenhaErrada'},null,401);
  await request('/auth/cadastro','POST',{nome:'Duplicado',email:emails[0],senha:'SenhaTeste#2026',tipo:'CLIENTE'},null,409);
  await request('/servicos/meus','GET',null,null,401);
  await request('/servicos/meus','GET',null,'invalido',401);
  const me=await request('/auth/me','GET',null,client.token);assert.equal(me.usuario.tipo,'CLIENTE');checks.push('Senha incorreta, duplicidade e tokens inválidos bloqueados');
  await request('/prestadores/me','PATCH',{cidade:'Anápolis',uf:'GO',descricao:`Perfil ${tag}`,precoHora:80,anosExperiencia:3},provider.token);
  const skills=(await request('/habilidades')).habilidades;assert.ok(skills.length,'Execute npm run db:setup para criar as habilidades');
  await request('/prestadores/me/habilidades','POST',{habilidadeId:skills[0].id},provider.token);
  const profile=(await request('/prestadores/me','GET',null,provider.token)).prestador;assert.equal(profile.cidade,'Anápolis');assert.equal(profile.habilidades[0].id,skills[0].id);
  const found=await request('/prestadores?q='+tag);assert.ok(found.dados.some(p=>p.usuarioId===provider.usuario.id));checks.push('Perfil e habilidade persistidos e retornados na busca');
  const body={prestadorId:provider.usuario.id,titulo:'Teste integração',descricao:`Atendimento de teste ${tag}`,categoria:skills[0].categoria,endereco:'Rua Teste, 100',cidade:'Anápolis',uf:'GO',valorCombinado:120};
  await request('/servicos','POST',body,provider.token,403);
  await request('/servicos','POST',{...body,descricao:'x'},client.token,400);
  const service=(await request('/servicos','POST',body,client.token,201)).servico;assert.equal(service.status,'PENDENTE');
  const [rows]=await pool.execute('SELECT status, cliente_id, prestador_id FROM servicos WHERE id=?',[service.id]);assert.equal(rows[0].status,'PENDENTE');assert.equal(rows[0].cliente_id,client.usuario.id);
  const mine=await request('/servicos/meus','GET',null,client.token);assert.ok(mine.dados.some(s=>s.id===service.id));
  const opportunities=await request('/servicos/oportunidades','GET',null,provider.token);assert.ok(opportunities.dados.some(s=>s.id===service.id));checks.push('Solicitação criada, consultada nas duas contas e confirmada diretamente no banco');
  await request(`/servicos/${service.id}`,'GET',null,outsider.token,403);
  await request(`/servicos/${service.id}/status`,'PATCH',{status:'ACEITO'},client.token,403);
  await request('/avaliacoes','POST',{servicoId:service.id,nota:5},client.token,409);
  await request(`/servicos/${service.id}/status`,'PATCH',{status:'ACEITO'},provider.token);
  await request(`/servicos/${service.id}/status`,'PATCH',{status:'CONCLUIDO'},provider.token);
  await request(`/servicos/${service.id}/status`,'PATCH',{status:'CANCELADO'},client.token,409);checks.push('Permissões e transições de status validadas');
  await request('/avaliacoes','POST',{servicoId:service.id,nota:5,comentario:'Fluxo validado'},client.token,201);
  await request('/avaliacoes','POST',{servicoId:service.id,nota:5},client.token,409);
  const publicProfile=(await request('/prestadores/'+provider.usuario.id)).prestador;assert.equal(Number(publicProfile.mediaAvaliacoes),5);
  const reviewed=(await request('/servicos/meus','GET',null,client.token)).dados.find(s=>s.id===service.id);assert.ok(reviewed.avaliacaoId);checks.push('Avaliação salva, média atualizada e duplicidade bloqueada');
  const cancel=(await request('/servicos','POST',body,client.token,201)).servico;
  await request(`/servicos/${cancel.id}/status`,'PATCH',{status:'CANCELADO'},client.token);
  await request(`/servicos/${cancel.id}/status`,'PATCH',{status:'ACEITO'},provider.token,409);
  await request('/servicos/oportunidades?page=abc','GET',null,provider.token,400);checks.push('Cancelamento e validação da paginação');
  for(const check of checks)t.diagnostic(check);
 } finally {
  if(emails.length)await pool.query('DELETE FROM usuarios WHERE email IN (?)',[emails]);
  if(server)await new Promise(resolve=>server.close(resolve));
  await pool.end();
 }
});
