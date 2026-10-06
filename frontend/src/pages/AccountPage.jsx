import {useState} from 'react';
import {Frame,Field,Notice,useResource,LoadState} from '../components/IntegratedUI';
import {api} from '../services/api';
export default function AccountPage({user,onLogout}){
 const [helpOpen,setHelpOpen]=useState(false);
 return <Frame user={user} title="Minha conta">
  <section className="account-hero">
   <div className={`avatar account-avatar ${user.tipo==='PRESTADOR'?'provider-avatar':''}`}>{user.nome?.charAt(0)}</div>
   <div><span className="eyebrow">{user.tipo==='PRESTADOR'?'PRESTADOR PRO SERVICE':'CLIENTE PRO SERVICE'}</span><h2>{user.nome}</h2><p>{user.email}{user.telefone?` · ${user.telefone}`:''}</p></div>
   <span className="verified-chip">✓ Conta ativa</span>
  </section>
  {user.tipo==='PRESTADOR'?<Editor/>:<ClientAccount/>}
  <section className="settings-panel">
   <h3>Configurações</h3>
   <div className="settings-row"><span>🔔 Notificações</span><b>Ativas</b></div>
   <div className="settings-row"><span>🛡️ Segurança da conta</span><b>Protegida</b></div>
   <button type="button" className="settings-row help-button" onClick={()=>setHelpOpen(true)}><span>❓ Central de ajuda</span><b>›</b></button>
  </section>
  {helpOpen&&<div className="help-overlay" role="presentation" onClick={()=>setHelpOpen(false)}>
   <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()}>
    <div className="help-header"><div><span className="eyebrow">SUPORTE PRO SERVICE</span><h2 id="help-title">Como podemos ajudar?</h2><p>Respostas rápidas para usar a plataforma com tranquilidade.</p></div><button type="button" className="help-close" onClick={()=>setHelpOpen(false)} aria-label="Fechar central de ajuda">×</button></div>
    <div className="help-options">
     <details><summary>🔎 Como encontrar um profissional?</summary><p>Acesse Buscar, escolha a categoria ou digite o serviço desejado e consulte os profissionais disponíveis.</p></details>
     <details><summary>💬 Como conversar com um profissional?</summary><p>Abra o perfil do prestador e use a opção de conversa. O histórico fica disponível em Mensagens.</p></details>
     <details><summary>🧰 Como solicitar um serviço?</summary><p>No perfil do profissional, envie uma solicitação com os dados do serviço. Depois acompanhe o andamento em Meus serviços.</p></details>
     <details><summary>📋 Onde acompanho meus serviços?</summary><p>Acesse Meus serviços para acompanhar solicitações, status e serviços concluídos.</p></details>
     <details><summary>⭐ Como avaliar um profissional?</summary><p>Quando o serviço estiver concluído, utilize a opção de avaliação disponível para registrar sua experiência.</p></details>
     <details><summary>🔐 Minha conta está protegida?</summary><p>O Pro Service usa autenticação e controle de acesso para proteger as áreas privadas da plataforma.</p></details>
    </div>
    <div className="help-footer"><span>💙</span><div><strong>Pro Service</strong><p>Conectando clientes e profissionais com confiança.</p></div></div>
   </section>
  </div>}
  <button className="logout-button" onClick={onLogout}>Sair da conta</button>
 </Frame>;
}
function ClientAccount(){return <section className="client-welcome"><div className="welcome-icon">💙</div><div><h3>Sua área Pro Service</h3><p>Encontre profissionais, acompanhe solicitações e avalie serviços concluídos.</p></div></section>}
function Editor(){
 const resource=useResource('/prestadores/me'),skills=useResource('/habilidades');
 const [error,setError]=useState(''),[success,setSuccess]=useState(''),[busy,setBusy]=useState(false);const p=resource.data?.prestador;
 async function action(path,method,body){setBusy(true);setError('');setSuccess('');try{await api(path,{method,body});setSuccess('Alteração salva com sucesso.');resource.reload()}catch(e){setError(e.message)}finally{setBusy(false)}}
 function save(e){e.preventDefault();const body=Object.fromEntries(new FormData(e.currentTarget));body.precoHora=body.precoHora===''?null:Number(body.precoHora);body.anosExperiencia=Number(body.anosExperiencia);action('/prestadores/me','PATCH',body)}
 return <section className="profile-editor"><div className="section-title-row"><div><span className="eyebrow">PERFIL PROFISSIONAL</span><h3>Informações públicas</h3></div><small>Visível aos clientes</small></div><Notice error={error} success={success}/><LoadState resource={resource}/>{p&&!resource.loading&&!resource.error&&<><form key={p.atualizadoEm||JSON.stringify(p)} className="form-area compact-form polished-form" onSubmit={save}><label>Sobre você<textarea name="descricao" defaultValue={p.descricao||''} maxLength={1000} placeholder="Conte sobre sua experiência e seu diferencial..."/></label><div className="two-cols"><Field label="Cidade" name="cidade" defaultValue={p.cidade||''} minLength={2} maxLength={100} required/><Field label="UF" name="uf" defaultValue={p.uf||''} minLength={2} maxLength={2} required/></div><div className="two-cols"><Field label="Preço por hora (R$)" name="precoHora" type="number" step="0.01" min="0" max="999999" defaultValue={p.precoHora??''}/><Field label="Anos de experiência" name="anosExperiencia" type="number" min="0" max="80" defaultValue={p.anosExperiencia} required/></div><button disabled={busy} className="primary-button">Salvar informações</button></form><div className="skills-panel"><h3>Minhas habilidades</h3><div className="tag-row">{p.habilidades.map(h=><button className="skill-tag" disabled={busy} key={h.id} onClick={()=>action('/prestadores/me/habilidades/'+h.id,'DELETE')}>{h.nome} <span>×</span></button>)}{!p.habilidades.length&&<p className="muted-paragraph">Adicione pelo menos uma habilidade para aparecer nas buscas.</p>}</div><LoadState resource={skills}/>{skills.data&&!skills.error&&!skills.loading&&<form className="add-skill" onSubmit={e=>{e.preventDefault();action('/prestadores/me/habilidades','POST',{habilidadeId:Number(new FormData(e.currentTarget).get('habilidadeId'))})}}><select name="habilidadeId" required defaultValue=""><option value="" disabled>Escolha uma habilidade</option>{(skills.data.habilidades||skills.data.dados||skills.data||[]).filter(h=>!p.habilidades.some(x=>x.id===h.id)).map(h=><option key={h.id} value={h.id}>{h.nome}</option>)}</select><button disabled={busy} className="primary-inline">Adicionar</button></form>}</div></>}</section>;
}
