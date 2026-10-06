import { Link } from 'react-router-dom';

export default function ProviderCard({ provider }) {
  return (
    <Link to={`/prestador/${provider.id}`} className="provider-card">
      <img className="avatar photo-avatar" src={provider.photo} alt={provider.name} />
      <div className="provider-info">
        <strong>{provider.name}</strong>
        <span>{provider.category}</span>
        <small>⭐ {provider.rating} · {provider.jobs} serviços · {provider.distance}</small>
      </div>
      <div className="provider-price">R$ {provider.price.toFixed(0)}</div>
    </Link>
  );
}
