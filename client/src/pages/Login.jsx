import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth';

export default function Login() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [email,setEmail]=useState('tender@example.com'); const [password,setPassword]=useState('Password@123'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e){ e.preventDefault(); setBusy(true); setError(''); try { await login(email,password); navigate('/'); } catch(err){ setError(err.response?.data?.message || 'Unable to sign in'); } finally { setBusy(false); } }
  return <div className="login-page">
    <div className="login-decoration"><div className="grid-orb"></div><div className="login-flow"><span>Tender Executive</span><i></i><span>Manager</span><i></i><span>Site Engineer</span></div></div>
    <div className="login-card">
      <div className="login-logo"><div className="brand-mark"><BriefcaseBusiness size={23}/></div><div><strong>PMS</strong><span>Project Management System</span></div></div>
      <div className="login-heading"><span className="eyebrow">DEMO PORTAL</span><h1>Move the project off Excel.</h1><p>Use role-based project, stage, task and BOQ workflows backed by MongoDB.</p></div>
      <form onSubmit={submit} className="form-stack">
        <label>Email<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required /></label>
        <label>Password<input value={password} onChange={e=>setPassword(e.target.value)} type="password" required /></label>
        {error && <div className="error-box">{error}</div>}
        <button className="primary-btn wide" disabled={busy}>{busy?'Signing in…':'Sign in'}<ArrowRight size={18}/></button>
      </form>
      <div className="demo-credentials"><ShieldCheck size={16}/><div><strong>Demo accounts</strong><span>Password: Password@123 · tender@example.com / manager@example.com / engineer@example.com</span></div></div>
    </div>
  </div>
}
