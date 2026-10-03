import { Router } from 'express';
import { requireAuth, allowRoles } from '../middleware/auth.js';
import Stage from '../models/Stage.js';
import StageStatus from '../models/StageStatus.js';
import ProjectType from '../models/ProjectType.js';
import User from '../models/User.js';
const router = Router();
router.use(requireAuth);
const modelMap = { stages: Stage, statuses: StageStatus, 'project-types': ProjectType };
router.get('/', async (_req, res, next) => {
  try {
    const [stages, statuses, projectTypes, users] = await Promise.all([
      Stage.find({ active: true }).sort({ name: 1 }), StageStatus.find({ active: true }).sort({ name: 1 }), ProjectType.find({ active: true }).sort({ name: 1 }), User.find({ active: true }).select('name email role').sort({ name: 1 })
    ]);
    res.json({ stages, statuses, projectTypes, users });
  } catch (err) { next(err); }
});

for (const [path, Model] of Object.entries(modelMap)) {
  router.post(`/${path}`, allowRoles('Tender Executive'), async (req, res, next) => {
    try { const name = String(req.body.name || '').trim(); if (!name) return res.status(400).json({ message: 'Name is required' }); const doc = await Model.create({ name }); res.status(201).json(doc); }
    catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'A record with this name already exists' }); next(err); }
  });
  router.put(`/${path}/:id`, allowRoles('Tender Executive'), async (req, res, next) => {
    try { const name = String(req.body.name || '').trim(); if (!name) return res.status(400).json({ message: 'Name is required' }); const doc = await Model.findByIdAndUpdate(req.params.id, { name }, { new: true, runValidators: true }); if (!doc) return res.status(404).json({ message: 'Record not found' }); res.json(doc); }
    catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'A record with this name already exists' }); next(err); }
  });
  router.delete(`/${path}/:id`, allowRoles('Tender Executive'), async (req, res, next) => {
    try { const doc = await Model.findByIdAndUpdate(req.params.id, { active: false }, { new: true }); if (!doc) return res.status(404).json({ message: 'Record not found' }); res.json({ ok: true }); }
    catch (err) { next(err); }
  });
}
export default router;
