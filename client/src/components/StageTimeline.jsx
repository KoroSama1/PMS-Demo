import { Check, Clock3, Circle, AlertTriangle } from 'lucide-react';

function state(stage) {
  if (stage.stageApprovalStatus === 'Approved') return 'done';
  if (stage.stageApprovalStatus === 'Pending Approval') return 'pending';
  if (stage.status === 'In Progress') return 'active';
  if (stage.status === 'Delayed') return 'delayed';
  return 'idle';
}

export default function StageTimeline({ stages=[] }) {
  return <div className="timeline">
    {stages.map((stage, idx) => {
      const s = state(stage); const Icon = s === 'done' ? Check : s === 'pending' ? Clock3 : s === 'delayed' ? AlertTriangle : s === 'active' ? Circle : Circle;
      return <div className={`timeline-row ${s}`} key={stage._id || idx}>
        <div className="timeline-node"><Icon size={15}/></div>
        <div className="timeline-line"></div>
        <div className="timeline-card">
          <div className="timeline-main"><div><strong>{idx+1}. {stage.name}</strong><small>{stage.ownerName || 'Owner not assigned'}</small></div><span className="timeline-status">{stage.stageApprovalStatus === 'Approved' ? 'Approved' : stage.stageApprovalStatus === 'Pending Approval' ? 'Awaiting approval' : stage.status}</span></div>
          <div className="timeline-meta"><span>Tasks: {(stage.tasks||[]).length}</span><span>Planned: {stage.estStartDate ? new Date(stage.estStartDate).toLocaleDateString() : '—'} → {stage.estEndDate ? new Date(stage.estEndDate).toLocaleDateString() : '—'}</span></div>
        </div>
      </div>;
    })}
  </div>;
}
