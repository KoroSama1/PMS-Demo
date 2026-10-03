import { useEffect, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import api from '../api';
import PageTitle from '../components/PageTitle';
import Modal from '../components/Modal';

const masterDefs=[['stages','Stages','stages'],['statuses','Stage Status','statuses'],['project-types','Project Type','projectTypes']];
export default function Masters(){
  const [data,setData]=useState(null);const[open,setOpen]=useState(false);const[kind,setKind]=useState('stages');const[edit,setEdit]=useState(null);const[name,setName]=useState('');const[error,setError]=useState('');
  function load(){api.get('/masters').then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||'Unable to load masters'))};useEffect(load,[]);
  function start(k,item=null){setKind(k);setEdit(item);setName(item?.name||'');setOpen(true)}
  async function save(){if(!name.trim())return;setError('');try{if(edit)await api.put(`/masters/${kind}/${edit._id}`,{name:name.trim()});else await api.post(`/masters/${kind}`,{name:name.trim()});setOpen(false);load()}catch(e){setError(e.response?.data?.message||'Save failed')}}
  async function remove(k,item){if(!confirm(`Hide “${item.name}” from new selections?`))return;try{await api.delete(`/masters/${k}/${item._id}`);load()}catch(e){setError(e.response?.data?.message||'Delete failed')}}
  return <div><PageTitle eyebrow="MASTER DATA" title="Masters" subtitle="Only the three core masters from the workbook are editable in this demo." />{error&&<div className="error-box">{error}</div>}<div className="master-grid">{masterDefs.map(([k,label,key])=><section className="panel master-card" key={k}><div className="panel-head"><div><h3>{label}</h3><p>{data?.[key]?.length||0} active records</p></div><button className="primary-btn small" onClick={()=>start(k)}><Plus size={15}/> Add</button></div><div className="master-list">{(data?.[key]||[]).map(item=><div className="master-row" key={item._id}><span>{item.name}</span><div><button className="icon-btn" onClick={()=>start(k,item)}><Edit3 size={15}/></button><button className="icon-btn danger" onClick={()=>remove(k,item)}><Trash2 size={15}/></button></div></div>)}</div></section>)}</div><Modal open={open} title={`${edit?'Edit':'Add'} ${masterDefs.find(x=>x[0]===kind)?.[1]||'master'}`} onClose={()=>setOpen(false)}><label>Name<input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&save()}/></label><div className="modal-actions"><button className="secondary-btn" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-btn" onClick={save}>{edit?'Save changes':'Create'}</button></div></Modal></div>
}
