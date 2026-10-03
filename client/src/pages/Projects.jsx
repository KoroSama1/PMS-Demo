import { useEffect, useMemo, useState } from 'react';
import { Filter, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import api from '../api';
import PageTitle from '../components/PageTitle';
import StatusBadge from '../components/StatusBadge';

export default function Projects(){
  const {user}=useAuth(); const navigate=useNavigate(); const [projects,setProjects]=useState([]); const [search,setSearch]=useState(''); const [status,setStatus]=useState('All');
  useEffect(()=>{api.get('/projects').then(r=>setProjects(r.data)).catch(console.error)},[]);
  const filtered=useMemo(()=>projects.filter(p=>(status==='All'||p.status===status)&&(`${p.projectId} ${p.name} ${p.clientName} ${p.projectType}`.toLowerCase().includes(search.toLowerCase()))),[projects,status,search]);
  return <div>
    <PageTitle eyebrow="PORTFOLIO" title="Projects" subtitle="One place to replace the spreadsheet progress view with live project records." action={user.role==='Tender Executive'&&<button className="primary-btn" onClick={()=>navigate('/projects/new')}><Plus size={18}/> Create Project</button>} />
    <div className="toolbar panel"><div className="search-box"><Search size={17}/><input placeholder="Search project, client or type…" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="filter-box"><Filter size={16}/><select value={status} onChange={e=>setStatus(e.target.value)}><option>All</option><option>In Progress</option><option>Completed</option><option>On Hold</option><option>Cancelled</option></select></div></div>
    <section className="panel">
      <div className="project-table wide-table"><div className="table-row table-head"><span>Project</span><span>Client</span><span>Type</span><span>Priority</span><span>Manager</span><span>Stages</span><span>Status</span><span>Progress</span></div>
      {filtered.map(p=><button className="table-row project-row" key={p._id} onClick={()=>navigate(`/projects/${p._id}`)}><span><strong>{p.projectId}</strong><small>{p.name}</small></span><span>{p.clientName||'—'}</span><span>{p.projectType||'—'}</span><span><StatusBadge status={p.priority}/></span><span>{p.projectManagerName||'—'}</span><span>{p.stages?.length||0}</span><span><StatusBadge status={p.status}/></span><span><div className="mini-progress"><i style={{width:`${p.progress||0}%`}}/></div><b>{p.progress||0}%</b></span></button>)}
      {!filtered.length&&<div className="empty">No matching projects.</div>}
      </div>
    </section>
  </div>
}
