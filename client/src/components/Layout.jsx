import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, BriefcaseBusiness, Database, FolderKanban, LogOut, Plus, Settings2, UserRound, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../auth';

const roleCopy = {
  'Tender Executive': 'Project control & approvals',
  Manager: 'Stage & task management',
  'Site Engineer': 'Assigned field work'
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canTender = user.role === 'Tender Executive';

  const nav = [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/work', label: canTender ? 'Approvals' : 'My Work', icon: ClipboardCheck },
    ...(canTender ? [{ to: '/projects/new', label: 'Create Project', icon: Plus }, { to: '/masters', label: 'Masters', icon: Database }] : [])
  ];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand" onClick={() => navigate('/')}>
        <div className="brand-mark"><BriefcaseBusiness size={20}/></div>
        <div><strong>PMS</strong><span>Project Management</span></div>
      </div>
      <div className="role-card">
        <div className="avatar"><UserRound size={18}/></div>
        <div><strong>{user.name}</strong><span>{user.role}</span></div>
      </div>
      <nav className="nav-list">
        {nav.map(item => {
          const Icon = item.icon; const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          return <button key={item.to} className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(item.to)}><Icon size={18}/><span>{item.label}</span></button>;
        })}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><Settings2 size={15}/><span>{roleCopy[user.role]}</span></div>
        <button className="logout-btn" onClick={logout}><LogOut size={17}/> Sign out</button>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar">
        <div><span className="eyebrow">PROJECT MANAGEMENT SYSTEM</span><h1>{roleCopy[user.role]}</h1></div>
        <div className="topbar-pill"><span className="live-dot"></span> MongoDB connected workflow</div>
      </header>
      <section className="page-content">{children}</section>
    </main>
  </div>;
}
