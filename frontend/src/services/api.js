const BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');
export const session = {
 get: () => sessionStorage.getItem('proservice_token'),
 set: token => sessionStorage.setItem('proservice_token', token),
 clear: () => sessionStorage.removeItem('proservice_token'),
};
export async function api(path, { method = 'GET', body, signal } = {}) {
 const token = session.get();
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), 15000);
 const abort = () => controller.abort();
 signal?.addEventListener('abort', abort, {once:true});
 try {
  const response = await fetch(BASE + path, { method, signal: controller.signal,
   headers: { ...(body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:`Bearer ${token}`} : {}) },
   ...(body ? {body:JSON.stringify(body)} : {}) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
   if (response.status === 401 && token && !path.startsWith('/auth/login')) {
    session.clear(); window.dispatchEvent(new Event('session-expired'));
   }
   const details = data.erro?.detalhes?.map(d => d.mensagem).join(' ');
   const err = new Error(details || data.erro?.mensagem || `Falha na solicitação (${response.status}).`);
   err.status = response.status; throw err;
  }
  return data;
 } catch (err) {
  if (err.name === 'AbortError') throw new Error('Tempo de resposta excedido. Tente novamente.');
  if (err instanceof TypeError) throw new Error('Não foi possível conectar à API. Confira se o backend está iniciado.');
  throw err;
 } finally { clearTimeout(timer); signal?.removeEventListener('abort',abort); }
}
