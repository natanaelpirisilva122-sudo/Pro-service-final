import {useEffect,useState} from 'react';
import {Routes,Route,Navigate} from 'react-router-dom';
import {api,session} from './services/api';
import LoginPage from './pages/LoginPage';
import SplashPage from './pages/SplashPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import AccountPage from './pages/AccountPage';
import SearchPage from './pages/SearchPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
export default function App(){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function restore(){setLoading(true);setError('');try{if(session.get())setUser((await api('/auth/me')).usuario)}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{restore();const expire=()=>{setUser(null);setError('Sua sessão expirou. Entre novamente.');};window.addEventListener('session-expired',expire);return()=>window.removeEventListener('session-expired',expire)},[]);
 function login(result){session.set(result.token);setUser(result.usuario);setError('')}
 function logout(){session.clear();setUser(null);setError('')}
 if(loading)return <main className="mobile-shell"><p role="status">Verificando sessão…</p></main>;
 if(error && session.get() && !user)return <main className="mobile-shell"><p role="alert">{error}</p><button onClick={restore}>Reconectar</button><button onClick={logout}>Voltar ao login</button></main>;
 const secure=element=>user?element:<Navigate to="/login" replace/>;
 return <Routes>
 <Route path="/" element={user?<Navigate to="/home" replace/>:<SplashPage/>}/>
 <Route path="/login" element={user?<Navigate to="/home" replace/>:<LoginPage onLogin={login} initialError={error}/>}/>
 <Route path="/cadastro" element={user?<Navigate to="/conta" replace/>:<RegisterPage onRegister={login}/>}/>
 <Route path="/home" element={secure(<HomePage user={user}/>)} />
 <Route path="/oportunidades" element={secure(user?.tipo==='PRESTADOR'?<ServicesPage user={user} onlyPending/>:<SearchPage user={user}/>)} />
 <Route path="/buscar" element={secure(<SearchPage user={user}/>)} />
 <Route path="/mensagens" element={secure(<MessagesPage user={user}/>)} />
 <Route path="/mensagens/:id" element={secure(<ChatPage user={user}/>)} />
 <Route path="/servicos" element={secure(<ServicesPage user={user}/>)} />
 <Route path="/prestador/:id" element={secure(<ProviderProfilePage user={user}/>)} />
 <Route path="/conta" element={secure(<AccountPage user={user} onLogout={logout}/>)} />
 <Route path="*" element={<Navigate to="/" replace/>}/></Routes>;
}
