import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth, allowRoles } from '../middleware/auth.js';
import Project from '../models/Project.js';
import Stage from '../models/Stage.js';
import User from '../models/User.js';

const router = Router();
router.use(requireAuth);

function canSeeProject(project, user) {
  if (user.role === 'Tender Executive') return true;
  const uid = user._id.toString();
  if (project.projectManagerId?.toString() === uid) return true;
  return (project.stages || []).some(s => s.ownerUserId?.toString() === uid || (s.tasks || []).some(t => t.assignedTo?.toString() === uid));
}

function computeProjectStatus(project) {
  const stages = project.stages || [];
  if (stages.length && stages.every(s => s.status === 'Completed' && s.stageApprovalStatus === 'Approved')) return 'Completed';
  if (project.status === 'On Hold' || project.status === 'Cancelled') return project.status;
  return stages.length ? 'In Progress' : 'Not Started';
}

router.get('/', async (req, res, next) => {
  try {
    const all = await Project.find().sort({ updatedAt: -1 }).lean();
    res.json(all.filter(p => canSeeProject(p, req.user)).map(p => {
      const total = p.stages?.length || 0;
      const completed = (p.stages || []).filter(s => s.stageApprovalStatus === 'Approved').length;
      return { ...p, progress: total ? Math.round(completed / total * 100) : 0 };
    }));
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!canSeeProject(project, req.user)) return res.status(403).json({ message: 'You do not have access to this project' });
    res.json(project);
  } catch (err) { next(err); }
});

router.post('/', allowRoles('Tender Executive'), async (req, res, next) => {
  try {
    const { projectId, name, clientName, projectType, projectManagerId, priority, estStartDate, expectedCompletionDate, remarks, stages = [], boq = [] } = req.body;
    if (!name || !projectType || !Array.isArray(stages) || !stages.length) return res.status(400).json({ message: 'Project name, project type and at least one stage are required' });

    const manager = projectManagerId ? await User.findOne({ _id: projectManagerId, role: 'Manager', active: true }) : null;
    const stageIds = stages.map(s => s.stageMasterId).filter(mongoose.isValidObjectId);
    const masters = await Stage.find({ _id: { $in: stageIds }, active: true }).lean();
    const byId = new Map(masters.map(s => [String(s._id), s]));
    const normalizedStages = stages.map((s, index) => {
      const master = byId.get(String(s.stageMasterId));
      if (!master) return null;
      return { stageMasterId: master._id, name: master.name, order: index + 1, ownerUserId: s.ownerUserId || null, ownerName: s.ownerName || '', status: s.status || 'Not Started', estStartDate: s.estStartDate || null, estEndDate: s.estEndDate || null, tasks: [] };
    }).filter(Boolean);
    if (!normalizedStages.length) return res.status(400).json({ message: 'Select at least one valid stage' });

    const project = await Project.create({
      projectId: projectId || `PRJ-${String(Date.now()).slice(-6)}`,
      name, clientName: clientName || '', projectType, projectManagerId: manager?._id || null, projectManagerName: manager?.name || '',
      priority: priority || 'Medium', estStartDate: estStartDate || null, expectedCompletionDate: expectedCompletionDate || null, actualStartDate: estStartDate || null,
      status: 'In Progress', remarks: remarks || '', stages: normalizedStages,
      boq: Array.isArray(boq) ? boq.filter(x => x.item && Number(x.qtyPlanned) >= 0).map(x => ({ item: x.item.trim(), qtyPlanned: Number(x.qtyPlanned), unit: x.unit || 'Nos.' })) : [],
      createdBy: req.user._id
    });
    res.status(201).json(project);
  } catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'Project ID already exists' }); next(err); }
});

router.post('/:id/stages/:stageId/tasks', allowRoles('Manager'), async (req, res, next) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Task title is required' });
    const project = await Project.findById(req.params.id); if (!project) return res.status(404).json({ message: 'Project not found' });
    const stage = project.stages.id(req.params.stageId); if (!stage) return res.status(404).json({ message: 'Stage not found' });
    const isOwner = stage.ownerUserId?.toString() === req.user._id.toString() || project.projectManagerId?.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: 'This stage is not assigned to you' });
    const engineer = assignedTo ? await User.findOne({ _id: assignedTo, role: 'Site Engineer', active: true }) : null;
    if (assignedTo && !engineer) return res.status(400).json({ message: 'Assigned user must be an active Site Engineer' });
    stage.tasks.push({ title, description: description || '', assignedTo: engineer?._id || null, assignedToName: engineer?.name || '', dueDate: dueDate || null });
    stage.status = 'In Progress';
    await project.save(); res.status(201).json(project);
  } catch (err) { next(err); }
});

router.put('/:id/stages/:stageId/tasks/:taskId', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id); if (!project) return res.status(404).json({ message: 'Project not found' });
    const stage = project.stages.id(req.params.stageId); const task = stage?.tasks.id(req.params.taskId); if (!stage || !task) return res.status(404).json({ message: 'Task not found' });
    const uid = req.user._id.toString(); const isManager = req.user.role === 'Manager' && (stage.ownerUserId?.toString() === uid || project.projectManagerId?.toString() === uid); const isEngineer = req.user.role === 'Site Engineer' && task.assignedTo?.toString() === uid;
    if (!isManager && !isEngineer) return res.status(403).json({ message: 'You cannot update this task' });

    if (isEngineer) {
      if (req.body.status === 'Completed') { task.status = 'Pending Approval'; task.completedAt = new Date(); }
      if (req.body.status === 'Rejected' || req.body.status === 'In Progress') task.status = 'In Progress';
      if (req.body.notes !== undefined) task.notes = req.body.notes;
    } else {
      if (req.body.title !== undefined) task.title = req.body.title;
      if (req.body.description !== undefined) task.description = req.body.description;
      if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate || null;
      if (req.body.status === 'Completed') { task.status = 'Completed'; task.approvedAt = new Date(); }
      if (req.body.status === 'Rejected') task.status = 'Rejected';
    }
    await project.save(); res.json(project);
  } catch (err) { next(err); }
});

router.post('/:id/stages/:stageId/submit', allowRoles('Manager'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id); if (!project) return res.status(404).json({ message: 'Project not found' });
    const stage = project.stages.id(req.params.stageId); if (!stage) return res.status(404).json({ message: 'Stage not found' });
    const owner = stage.ownerUserId?.toString() === req.user._id.toString() || project.projectManagerId?.toString() === req.user._id.toString();
    if (!owner) return res.status(403).json({ message: 'Stage not assigned to you' });
    if ((stage.tasks || []).some(t => t.status !== 'Completed')) return res.status(400).json({ message: 'All tasks must be approved/completed before stage submission' });
    stage.stageApprovalStatus = 'Pending Approval'; stage.status = 'Completed';
    await project.save(); res.json(project);
  } catch (err) { next(err); }
});

router.post('/:id/stages/:stageId/decision', allowRoles('Tender Executive'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id); if (!project) return res.status(404).json({ message: 'Project not found' });
    const stage = project.stages.id(req.params.stageId); if (!stage) return res.status(404).json({ message: 'Stage not found' });
    const approved = req.body.approved !== false;
    stage.stageApprovalStatus = approved ? 'Approved' : 'Rejected'; stage.status = approved ? 'Completed' : 'In Progress';
    if (approved) stage.actualEndDate = new Date();
    project.status = computeProjectStatus(project);
    await project.save(); res.json(project);
  } catch (err) { next(err); }
});

router.post('/:id/boq/:boqId/use', async (req, res, next) => {
  try {
    const qty = Number(req.body.qty); if (!Number.isFinite(qty) || qty <= 0) return res.status(400).json({ message: 'Quantity must be greater than zero' });
    const project = await Project.findById(req.params.id); if (!project || !canSeeProject(project, req.user)) return res.status(404).json({ message: 'Project not found' });
    const item = project.boq.id(req.params.boqId); if (!item) return res.status(404).json({ message: 'BOQ item not found' });
    const available = item.qtyPlanned + item.amendments.filter(a => a.status === 'Approved').reduce((sum, a) => sum + a.qty, 0) - item.qtyUsed;
    if (qty > available) return res.status(400).json({ message: `Only ${available} ${item.unit} available` });
    item.qtyUsed += qty; await project.save(); res.json(project);
  } catch (err) { next(err); }
});

router.post('/:id/boq/:boqId/amend', async (req, res, next) => {
  try {
    const qty = Number(req.body.qty); const reason = String(req.body.reason || '').trim();
    if (!Number.isFinite(qty) || qty <= 0 || !reason) return res.status(400).json({ message: 'Additional quantity and reason are required' });
    const project = await Project.findById(req.params.id); if (!project || !canSeeProject(project, req.user)) return res.status(404).json({ message: 'Project not found' });
    const item = project.boq.id(req.params.boqId); if (!item) return res.status(404).json({ message: 'BOQ item not found' });
    item.amendments.push({ qty, reason, requestedBy: req.user._id, requestedByName: req.user.name }); await project.save(); res.json(project);
  } catch (err) { next(err); }
});

router.post('/:id/boq/:boqId/amendments/:amendmentId/decision', allowRoles('Tender Executive'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id); if (!project) return res.status(404).json({ message: 'Project not found' });
    const item = project.boq.id(req.params.boqId); const amendment = item?.amendments.id(req.params.amendmentId); if (!item || !amendment) return res.status(404).json({ message: 'Amendment not found' });
    amendment.status = req.body.approved === false ? 'Rejected' : 'Approved'; amendment.decidedAt = new Date(); await project.save(); res.json(project);
  } catch (err) { next(err); }
});

export default router;
