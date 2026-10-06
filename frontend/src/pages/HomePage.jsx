import {useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import MobileShell from '../components/MobileShell';
import BottomNav from '../components/BottomNav';
import {Field,useResource,LoadState,Pager,money} from '../components/IntegratedUI';

const icons=['⚡','🔧','🎨','🧱','🪚','❄️','🧹','🌿'];

export default function HomePage({user}){
 return user.tipo==='PRESTADOR'?<ProviderDashboard user={user}/>:<ClientHome user={user}/>;
}

function ClientHome({user}){
 const [filters,setFilters]=useState(''),[page,setPage]=useState(1);
 const resource=useResource(`/prestadores?page=${page}&limit=10${filters}`);
 const skills=useResource('/habilidades');

 function goToResults(){
  setTimeout(()=>{document.getElementById('resultados-busca')?.scrollIntoView({behavior:'smooth',block:'start'});},150);
 }

 function search(e){
  e.preventDefault();
  const q=new URLSearchParams();
  for(const [k,v] of new FormData(e.currentTarget)){
   if(String(v).trim())q.set(k,String(v).trim());
  }
  setFilters(q.toString()?'&'+q.toString():'');
  setPage(1);
  goToResults();
 }

 function searchCategory(skill){
  const q=new URLSearchParams();
  q.set('habilidade',skill.nome);
  setFilters('&'+q.toString());
  setPage(1);
  goToResults();
 }

 const providers=resource.data?.dados||[];
 const skillList=skills.data?.dados||skills.data?.habilidades||skills.data||[];

 return <MobileShell><section className="content-scroll with-bottom-nav app-page">

  <header className="home-header"><div><span className="eyebrow">PRO SERVICE · CLIENTE</span><h2>Olá, {user.nome?.split(' ')[0]} 👋</h2><p className="page-subtitle">O serviço certo, com profissionais de confiança.</p></div><Link to="/conta" className="avatar profile-avatar" aria-label="Minha conta">{user.nome?.charAt(0)}</Link></header>

  <section className="hero-search"><div className="hero-copy"><span className="hero-badge">✓ Plataforma conectada</span><h1>Do problema à solução,<br/><em>sem complicação.</em></h1><p>Busque, compare e solicite serviços em poucos minutos.</p></div><div className="mascot-mini">🛠️</div></section>

  <form className="search-panel elevated" onSubmit={search}><div className="search-row"><Field aria-label="Buscar profissional" name="q" placeholder="O que você precisa? Ex.: eletricista" maxLength={120}/><button className="search-button" aria-label="Buscar">Buscar</button></div><div className="search-filters"><Field label="Categoria" name="habilidade" placeholder="Ex.: Elétrica" maxLength={100}/><Field label="Cidade" name="cidade" placeholder="Sua cidade" maxLength={100}/></div></form>

  <section className="quick-benefits"><div><b>🛡️</b><span><strong>Mais segurança</strong><small>Perfis e avaliações</small></span></div><div><b>⚡</b><span><strong>Mais agilidade</strong><small>Encontre em minutos</small></span></div><div><b>⭐</b><span><strong>Escolha melhor</strong><small>Compare profissionais</small></span></div></section>

  <section className="section-block"><div className="section-title-row"><div><span className="eyebrow">EXPLORE</span><h3>Categorias populares</h3></div><small>{skillList.length?`${skillList.length} opções`:'Serviços'}</small></div><LoadState resource={skills}/><div className="category-grid">{skillList.slice(0,8).map((s,i)=><article className="category-item" key={s.id||i} onClick={()=>searchCategory(s)} role="button" tabIndex="0" onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')searchCategory(s)}} style={{cursor:'pointer'}}><span className="category-icon">{icons[i%icons.length]}</span><strong>{s.nome}</strong><small>{s.categoria||'Serviço profissional'}</small></article>)}</div></section>

  <section id="resultados-busca" className="section-block"><div className="section-title-row"><div><span className="eyebrow">PERTO DE VOCÊ</span><h3>Profissionais disponíveis</h3></div><small>{resource.data?.paginacao?.total ?? 0} encontrados</small></div><LoadState resource={resource}/>{!resource.loading&&!resource.error&&providers.length===0&&<div className="empty-state"><span>🔎</span><h3>Nenhum profissional encontrado</h3><p>Não encontramos profissionais disponíveis para essa busca. Tente outra categoria ou cidade.</p></div>}<div className="provider-grid">{providers.map(p=><Link to={`/prestador/${p.usuarioId}`} className="provider-card premium-card" key={p.usuarioId}><div className="avatar photo-avatar">{p.nome?.charAt(0)}</div><div className="provider-info"><strong>{p.nome}</strong><span>{p.habilidades?.map(h=>h.nome).join(' · ')||'Profissional Pro Service'}</span><small>⭐ {p.totalAvaliacoes?`${p.mediaAvaliacoes} (${p.totalAvaliacoes})`:'Novo na plataforma'} · 📍 {p.cidade||'Local não informado'} {p.uf||''}</small></div><div className="provider-price"><small>a partir de</small>{money(p.precoHora)}<b>Ver perfil →</b></div></Link>)}</div><Pager page={page} setPage={setPage} total={resource.data?.paginacao?.paginas}/></section>

 </section><BottomNav role="cliente"/></MobileShell>;
}

function ProviderDashboard({user}){
 const jobs=useResource('/servicos/oportunidades?page=1&limit=6');
 const mine=useResource('/servicos/meus?page=1&limit=20');
 const profile=useResource('/prestadores/me');
 const data=mine.data?.dados||[];
 const counts=useMemo(()=>({pending:data.filter(x=>x.status==='PENDENTE').length,accepted:data.filter(x=>x.status==='ACEITO').length,done:data.filter(x=>x.status==='CONCLUIDO').length}),[data]);
 const p=profile.data?.prestador;

 return <MobileShell><section className="content-scroll with-bottom-nav app-page">

  <header className="home-header"><div><span className="eyebrow">PAINEL DO PRESTADOR</span><h2>Olá, {user.nome?.split(' ')[0]} 👋</h2><p className="page-subtitle">Novas oportunidades podem estar esperando por você.</p></div><Link to="/conta" className="avatar provider-avatar">{user.nome?.charAt(0)}</Link></header>

  <section className="provider-hero"><div><span className="hero-badge warm">⚡ ÁREA PROFISSIONAL</span><h1>Transforme oportunidades<br/>em novos trabalhos.</h1><p>Complete seu perfil, responda solicitações e construa sua reputação.</p><Link to="/oportunidades" className="hero-action">Ver oportunidades →</Link></div><div className="score-card"><span>Seu perfil</span><strong>{p?.habilidades?.length ? 'Ativo' : 'Complete'}</strong><small>{p?.habilidades?.length||0} habilidade(s)</small></div></section>

  <section className="stats-grid"><article><span>📥</span><div><strong>{jobs.data?.paginacao?.total??0}</strong><small>Oportunidades</small></div></article><article><span>🗓️</span><div><strong>{counts.accepted}</strong><small>Em andamento</small></div></article><article><span>✅</span><div><strong>{counts.done}</strong><small>Concluídos</small></div></article><article><span>⭐</span><div><strong>{p?.totalAvaliacoes?Number(p.mediaAvaliacoes).toFixed(1):'—'}</strong><small>Avaliação</small></div></article></section>

  <section className="section-block"><div className="section-title-row"><div><span className="eyebrow">NOVOS PEDIDOS</span><h3>Oportunidades recentes</h3></div><Link to="/oportunidades" className="text-link">Ver todas →</Link></div><LoadState resource={jobs}/><div className="opportunity-grid">{(jobs.data?.dados||[]).slice(0,4).map(s=><Link to="/oportunidades" className="opportunity-card modern" key={s.id}><div className="opportunity-header"><span className="status-badge">NOVO</span><b>#{s.id}</b></div><h3>{s.titulo}</h3><p>{s.descricao}</p><div className="job-meta"><span>📍 {s.cidade}/{s.uf}</span><span>💰 {money(s.valorCombinado)}</span></div><div className="card-cta">Ver solicitação →</div></Link>)}</div>{!jobs.loading&&!jobs.error&&!(jobs.data?.dados||[]).length&&<div className="empty-state"><span>✨</span><h3>Tudo em dia</h3><p>Novas oportunidades aparecerão aqui.</p></div>}</section>

  <section className="profile-completion"><div><span className="eyebrow">DICA PRO SERVICE</span><h3>Um perfil completo gera mais confiança</h3><p>Adicione descrição, cidade, preço e suas principais habilidades.</p></div><Link to="/conta" className="primary-inline">Completar perfil</Link></section>

 </section><BottomNav role="prestador"/></MobileShell>;
}