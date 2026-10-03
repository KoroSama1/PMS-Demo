import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PageTitle from '../components/PageTitle';

const inventoryCatalog = ['VFD Panel','PLC Panel','Encoders','Ultrasonic Level Transmitter','Radar Level Transmitter','CCTV','Generator','LED Display Screen','Server Rack & Server','Software / SCADA','Solar System','Batteries & UPS','PLC Panel with HMI & I/O Cards','Electromagnetic Flowmeters – Different Sizes','PLC','HMI','I/O Cards','1 kVA UPS','Pressure Transmitter','Level Transmitter','Server','Valves','Actuators','Water Quality Analysers','Pressure Transmitters','AMR Water Meters – Different Sizes'];

export default function CreateProject(){
  const navigate=useNavigate(); const [master,setMaster]=useState(null); const [form,setForm]=useState({projectId:'',name:'',clientName:'',projectType:'',projectManagerId:'',priority:'Medium',estStartDate:'',expectedCompletionDate:'',remarks:''}); const [selected,setSelected]=useState([]); const [boq,setBoq]=useState([{item:'',qtyPlanned:1,unit:'Nos.'}]); const [drag,setDrag]=useState(null); const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  useEffect(()=>{api.get('/masters').then(r=>setMaster(r.data)).catch(e=>setError(e.response?.data?.message||'Unable to load masters'))},[]);
  const managers=useMemo(()=>master?.users?.filter(u=>u.role==='Manager')||[],[master]);
  function addStage(stage){ if(!selected.some(s=>s._id===stage._id)) setSelected([...selected,{...stage,ownerUserId:'',ownerName:''}]); }
  function removeStage(id){setSelected(selected.filter(s=>s._id!==id))}
  function moveStage(index,dir){const next=[...selected]; const to=index+dir; if(to<0||to>=next.length)return; [next[index],next[to]]=[next[to],next[index]]; setSelected(next)}
  function ownerChange(id,val){const owner=master.users.find(u=>u._id===val);setSelected(selected.map(s=>s._id===id?{...s,ownerUserId:val,ownerName:owner?.name||''}:s))}
  function addBoq(){setBoq([...boq,{item:'',qtyPlanned:1,unit:'Nos.'}])}
  function save(){
    if(!form.name||!form.projectType||!selected.length){setError('Project name, project type and at least one stage are required.');return}
    setSaving(true);setError('');api.post('/projects',{...form,stages:selected.map(s=>({stageMasterId:s._id,ownerUserId:s.ownerUserId||null,ownerName:s.ownerName||'',estStartDate:form.estStartDate||null,estEndDate:form.expectedCompletionDate||null})),boq:boq.filter(x=>x.item&&Number(x.qtyPlanned)>0)}).then(r=>navigate(`/projects/${r.data._id}`)).catch(e=>setError(e.response?.data?.message||'Could not create project')).finally(()=>setSaving(false));
  }
  return <div>
    <PageTitle eyebrow="TENDER EXECUTIVE" title="Create new project" subtitle="Mirror the Excel setup, then turn every selected stage into a live workflow owner." action={<button className="secondary-btn" onClick={()=>navigate('/projects')}><ArrowLeft size={17}/> Back</button>} />
    {error&&<div className="error-box">{error}</div>}
    <div className="form-layout">
      <section className="panel form-section"><div className="section-number">01</div><div className="section-copy"><h3>Project details</h3><p>Basic project information from the first PMS sheet.</p></div><div className="field-grid">
        <label>Project ID<input value={form.projectId} placeholder="PRJ-0002" onChange={e=>setForm({...form,projectId:e.target.value})}/></label>
        <label>Project name<input value={form.name} placeholder="DVC SCADA Expansion" onChange={e=>setForm({...form,name:e.target.value})}/></label>
        <label>Client name<input value={form.clientName} placeholder="DVC" onChange={e=>setForm({...form,clientName:e.target.value})}/></label>
        <label>Project type<select value={form.projectType} onChange={e=>setForm({...form,projectType:e.target.value})}><option value="">Select type</option>{(master?.projectTypes||[]).map(x=><option key={x._id} value={x.name}>{x.name}</option>)}</select></label>
        <label>Project manager<select value={form.projectManagerId} onChange={e=>setForm({...form,projectManagerId:e.target.value})}><option value="">Select manager</option>{managers.map(x=><option key={x._id} value={x._id}>{x.name}</option>)}</select></label>
        <label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label>
        <label>Estimated start<input type="date" value={form.estStartDate} onChange={e=>setForm({...form,estStartDate:e.target.value})}/></label>
        <label>Expected completion<input type="date" value={form.expectedCompletionDate} onChange={e=>setForm({...form,expectedCompletionDate:e.target.value})}/></label>
        <label className="full">Remarks<textarea rows="3" value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} placeholder="Add context from the Excel remarks column…"/></label>
      </div></section>

      <section className="panel form-section"><div className="section-number">02</div><div className="section-copy"><h3>Stage selection & order</h3><p>Select the stages needed for this project, order them, then assign the owner.</p></div>
        <div className="stage-picker"><div className="stage-library"><div className="subhead">Available stages <span>{master?.stages?.length||0}</span></div>{(master?.stages||[]).filter(s=>!selected.some(x=>x._id===s._id)).map(s=><button key={s._id} className="stage-library-row" onClick={()=>addStage(s)}><span>{s.name}</span><Plus size={16}/></button>)}</div>
        <div className="selected-stages"><div className="subhead">Selected stages <span>{selected.length}</span></div>{selected.map((s,index)=><div key={s._id} className="selected-stage" draggable onDragStart={()=>setDrag(index)} onDragOver={e=>e.preventDefault()} onDrop={()=>{if(drag===null||drag===index)return;const next=[...selected];const [moved]=next.splice(drag,1);next.splice(index,0,moved);setSelected(next);setDrag(null)}}><GripVertical size={17} className="drag-icon"/><div className="stage-index">{index+1}</div><div className="stage-name"><strong>{s.name}</strong><select value={s.ownerUserId||''} onChange={e=>ownerChange(s._id,e.target.value)}><option value="">Assign owner</option>{master.users.filter(u=>u.role!=='Tender Executive').map(u=><option key={u._id} value={u._id}>{u.name} · {u.role}</option>)}</select></div><div className="stage-controls"><button className="icon-btn" onClick={()=>moveStage(index,-1)}><ArrowUp size={15}/></button><button className="icon-btn" onClick={()=>moveStage(index,1)}><ArrowDown size={15}/></button><button className="icon-btn danger" onClick={()=>removeStage(s._id)}><Trash2 size={15}/></button></div></div>)}{!selected.length&&<div className="empty small">Add stages from the left.</div>}</div></div>
      </section>

      <section className="panel form-section"><div className="section-number">03</div><div className="section-copy"><h3>BOQ / inventory</h3><p>Start the project with the item quantities available for use.</p></div>
        <div className="boq-editor"><div className="boq-head"><span>Item</span><span>Qty</span><span>Unit</span><span></span></div>{boq.map((row,i)=><div className="boq-row" key={i}><select value={row.item} onChange={e=>{const x=[...boq];x[i].item=e.target.value;setBoq(x)}}><option value="">Select item</option>{inventoryCatalog.map(item=><option key={item} value={item}>{item}</option>)}</select><input type="number" min="0" value={row.qtyPlanned} onChange={e=>{const x=[...boq];x[i].qtyPlanned=e.target.value;setBoq(x)}}/><input value={row.unit} onChange={e=>{const x=[...boq];x[i].unit=e.target.value;setBoq(x)}}/><button className="icon-btn danger" onClick={()=>setBoq(boq.filter((_,j)=>j!==i))}><Trash2 size={15}/></button></div>)}<button className="secondary-btn" onClick={addBoq}><Plus size={16}/> Add BOQ item</button></div>
      </section>
    </div>
    <div className="sticky-action"><button className="secondary-btn" onClick={()=>navigate('/projects')}>Cancel</button><button className="primary-btn" disabled={saving} onClick={save}><Save size={17}/>{saving?'Creating…':'Create Project'}</button></div>
  </div>
}
