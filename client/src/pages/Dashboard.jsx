import { useEffect, useState } from 'react';
import { ArrowUpRight, CircleAlert, FolderOpen, ListChecks, Plus, ShieldCheck, TimerReset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import api from '../api';
import PageTitle from '../components/PageTitle';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard(){
  const {user}=useAuth(); const navigate=useNavigate(); const [data,setData]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{ api.get('/dashboard/summary').then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||'Could not load dashboard')); },[]);
  const m=data?.metrics || {};
  return <div>
    <PageTitle eyebrow="OVERVIEW" title={`Good morning, ${user.name.split(' ')[0]}.`} subtitle={user.role==='Tender Executive'?'Control project setup, approvals and inventory.':user.role==='Manager'?'Focus on your stages, sub-steps and approvals.':'Focus on the work assigned to you and report material usage.'} action={user.role==='Tender Executive'&&<button className="primary-btn" onClick={()=>navigate('/projects/new')}><Plus size={18}/> New Project</button>} />
    {error && <div className="error-box">{error}</div>}
    <div className="stat-grid">
      <StatCard label="Active Projects" value={m.active ?? '—'} detail={`${m.totalProjects ?? 0} total`} tone="teal"/>
      <StatCard label={user.role==='Site Engineer'?'My Tasks':user.role==='Manager'?'My Stages':'Pending Approvals'} value={user.role==='Site Engineer' ? (m.myTasks??0) : user.role==='Manager' ? (m.myStages??0) : (m.pendingApprovals??0)} detail={user.role==='Site Engineer'?`${m.pendingTaskApprovals??0} pending approvals`:user.role==='Manager'?`${m.pendingTaskApprovals??0} task approvals`: `${m.critical??0} critical active`} tone="violet"/>
      <StatCard label="Completed Projects" value={m.completed ?? '—'} detail="Approved stage completion" tone="blue"/>
      <StatCard label="On Hold" value={m.onHold ?? '—'} detail="Projects needing attention" tone="amber"/>
    </div>

    <div className="two-col">
      <section className="panel">
        <div className="panel-head"><div><h3>Recent projects</h3><p>Same project progress concept as the Excel PMS sheet, now interactive.</p></div><button className="text-btn" onClick={()=>navigate('/projects')}>View all <ArrowUpRight size={15}/></button></div>
        <div className="project-table">
          <div className="table-row table-head"><span>Project</span><span>Type</span><span>Status</span><span>Progress</span></div>
          {(data?.recentProjects||[]).map(p=>{ const total=p.stages?.length||0; const done=(p.stages||[]).filter(s=>s.stageApprovalStatus==='Approved').length; const progress=total?Math.round(done/total*100):0; return <button className="table-row project-row" key={p._id} onClick={()=>navigate(`/projects/${p._id}`)}><span><strong>{p.projectId}</strong><small>{p.name}</small></span><span>{p.projectType||'—'}</span><span><StatusBadge status={p.status}/></span><span><div className="mini-progress"><i style={{width:`${progress}%`}}></i></div><b>{progress}%</b></span></button>})}
          {!data?.recentProjects?.length && <div className="empty">No projects yet.</div>}
        </div>
      </section>
      <section className="panel focus-panel">
        <div className="panel-head"><div><h3>Workflow pulse</h3><p>Where work is waiting right now.</p></div></div>
        <div className="pulse-list">
          <div><div className="pulse-icon teal"><FolderOpen size={17}/></div><span>Active projects</span><strong>{m.active??0}</strong></div>
          <div><div className="pulse-icon amber"><CircleAlert size={17}/></div><span>Critical active</span><strong>{m.critical??0}</strong></div>
          <div><div className="pulse-icon violet"><ListChecks size={17}/></div><span>Task approvals</span><strong>{m.pendingTaskApprovals??0}</strong></div>
          <div><div className="pulse-icon blue"><TimerReset size={17}/></div><span>Stage approvals</span><strong>{m.pendingApprovals??0}</strong></div>
        </div>
        <div className="workflow-note"><ShieldCheck size={17}/><span>MongoDB stores the project, stage, task and BOQ state separately from the UI.</span></div>
      </section>
    </div>
  </div>
}
