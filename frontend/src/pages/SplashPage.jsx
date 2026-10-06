import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MobileShell from '../components/MobileShell';

const categories = [
  { icon: '⚡', title: 'Eletricista', text: 'Instalações e reparos' },
  { icon: '🔧', title: 'Encanador', text: 'Manutenção hidráulica' },
  { icon: '🎨', title: 'Pintor', text: 'Pintura e acabamento' },
  { icon: '🧹', title: 'Diarista', text: 'Limpeza residencial' },
];

export default function SplashPage() {
  const navigate = useNavigate();
  const [service, setService] = useState('');
  const [location, setLocation] = useState('');

  function handleSearch(event) {
    event.preventDefault();
    navigate('/login');
  }

  return (
    <MobileShell className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="Pro Service - início">
          <span className="landing-brand-logo"><img src={logo} alt="" /></span>
          <span>Pro Service</span>
        </Link>

        <nav className="landing-nav" aria-label="Navegação principal">
          <a href="#como-funciona">Como funciona</a>
          <a href="#servicos">Serviços</a>
          <a href="#seguranca">Segurança</a>
        </nav>

        <div className="landing-account-actions">
          <Link to="/login" className="landing-login">Entrar</Link>
          <Link to="/cadastro" className="landing-signup">Criar conta</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="landing-kicker">SERVIÇOS COM CONFIANÇA</span>
          <h1>Encontre o <em>profissional certo</em> para o seu serviço.</h1>
          <p>Conectamos você a profissionais qualificados para resolver o que precisa com praticidade, segurança e avaliações de outros clientes.</p>

          <form className="landing-search" onSubmit={handleSearch}>
            <label className="landing-search-field">
              <span>⌕</span>
              <input value={service} onChange={(e) => setService(e.target.value)} placeholder="Qual serviço você precisa?" aria-label="Serviço" />
            </label>
            <label className="landing-search-field landing-location-field">
              <span>⌖</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Sua cidade" aria-label="Cidade" />
            </label>
            <button type="submit">Buscar profissionais</button>
          </form>

          <div className="landing-trust" id="seguranca">
            <span><b>✓</b> Profissionais verificados</span>
            <span><b>★</b> Avaliações de clientes</span>
            <span><b>◆</b> Contratação segura</span>
          </div>
        </div>

        <div className="landing-hero-visual" aria-label="Mascote Pro Service">
          <div className="landing-visual-glow" />
          <div className="landing-mascot-card">
            <img src={logo} alt="Mascote Pro Service" className="landing-mascot" />
          </div>
          <div className="landing-float-card landing-rating-card"><span>★</span><div><strong>4,9</strong><small>Excelente avaliação</small></div></div>
          <div className="landing-float-card landing-verified-card"><span>✓</span><div><strong>Verificado</strong><small>Perfil profissional</small></div></div>
        </div>
      </section>

      <section className="landing-services" id="servicos">
        <div className="landing-section-heading">
          <div><span className="landing-kicker">CATEGORIAS</span><h2>Serviços mais procurados</h2></div>
          <Link to="/login">Ver todos →</Link>
        </div>
        <div className="landing-category-grid">
          {categories.map((item) => (
            <Link to="/login" className="landing-category-card" key={item.title}>
              <span className="landing-category-icon">{item.icon}</span>
              <strong>{item.title}</strong>
              <small>{item.text}</small>
              <b>→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-how" id="como-funciona">
        <div className="landing-section-heading landing-centered-heading">
          <div><span className="landing-kicker">SIMPLES E RÁPIDO</span><h2>Como o Pro Service funciona</h2><p>Do problema resolvido à contratação em apenas três etapas.</p></div>
        </div>
        <div className="landing-steps">
          <article><span className="landing-step-number">01</span><div className="landing-step-icon">⌕</div><h3>Busque</h3><p>Informe o serviço que precisa e encontre profissionais disponíveis.</p></article>
          <article><span className="landing-step-number">02</span><div className="landing-step-icon">★</div><h3>Compare</h3><p>Confira perfis, especialidades e avaliações antes de escolher.</p></article>
          <article><span className="landing-step-number">03</span><div className="landing-step-icon">✓</div><h3>Contrate</h3><p>Solicite o serviço e acompanhe o atendimento pela plataforma.</p></article>
        </div>
      </section>

      <section className="landing-cta">
        <div><span className="landing-kicker landing-kicker-light">PARA PROFISSIONAIS</span><h2>Quer encontrar novas oportunidades?</h2><p>Crie seu perfil profissional e conecte-se a clientes que precisam dos seus serviços.</p></div>
        <Link to="/cadastro">Quero ser prestador →</Link>
      </section>

      <footer className="landing-footer">
        <div className="landing-brand"><span className="landing-brand-logo"><img src={logo} alt="" /></span><span>Pro Service</span></div>
        <p>Plataforma para conectar clientes e prestadores de serviços.</p>
        <span>© 2026 Pro Service</span>
      </footer>
    </MobileShell>
  );
}
