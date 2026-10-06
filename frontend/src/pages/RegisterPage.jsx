import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import MobileShell from '../components/MobileShell';
import {Field,Notice} from '../components/IntegratedUI';
import {api} from '../services/api';
export default function RegisterPage({onRegister}){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);const navigate=useNavigate();
 async function submit(e){e.preventDefault();setBusy(true);setError('');const body=Object.fromEntries(new FormData(e.currentTarget));if(!body.telefone)delete body.telefone;try{const r=await api('/auth/cadastro',{method:'POST',body});onRegister(r);navigate(r.usuario.tipo==='PRESTADOR'?'/conta':'/home')}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <MobileShell><form className="form-area" onSubmit={submit}><h1>Criar conta</h1><Field label="Nome completo" name="nome" minLength={3} maxLength={120} required/><Field label="E-mail" name="email" type="email" maxLength={180} required/><Field label="Telefone (opcional)" name="telefone" type="tel" maxLength={20}/><label>Tipo de conta<select name="tipo"><option value="CLIENTE">Cliente</option><option value="PRESTADOR">Prestador</option></select></label><Field label="Senha (mínimo 8 caracteres)" name="senha" type="password" autoComplete="new-password" minLength={8} maxLength={72} required/><p>Prestadores completam o perfil e as habilidades após o cadastro.</p><Notice error={error}/><button className="primary-button" disabled={busy}>{busy?'Salvando…':'Cadastrar'}</button><Link to="/login">Já tenho conta</Link></form></MobileShell>;
}
