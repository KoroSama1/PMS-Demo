import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import Project from '../models/Project.js';
const router = Router(); router.use(requireAuth);
router.get('/summary', async (req, res, next) => {
  try {
    const projects = await Project.find().lean(); const uid = req.user._id.toString();
    const metrics = {
      totalProjects: projects.length, active: projects.filter(p=>p.status==='In Progress').length, completed: projects.filter(p=>p.status==='Completed').length,
      onHold: projects.filter(p=>p.status==='On Hold').length, critical: projects.filter(p=>p.priority==='Critical'&&p.status!=='Completed').length,
      myStages: 0, myTasks: 0, pendingApprovals: 0, pendingTaskApprovals: 0
    };
    for (const p of projects) for (const s of p.stages || []) {
      if (String(s.ownerUserId||'')===uid) metrics.myStages++;
      if (s.stageApprovalStatus==='Pending Approval') metrics.pendingApprovals++;
      for (const t of s.tasks || []) { if (String(t.assignedTo||'')===uid) metrics.myTasks++; if (t.status==='Pending Approval') metrics.pendingTaskApprovals++; }
    }
    res.json({ metrics, recentProjects: projects.sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6) });
  } catch (err) { next(err); }
});
export default router;
