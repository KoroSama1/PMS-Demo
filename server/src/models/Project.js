import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedToName: { type: String, default: '' },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Pending Approval', 'Completed', 'Rejected'], default: 'Not Started' },
  dueDate: { type: Date, default: null }, completedAt: { type: Date, default: null }, approvedAt: { type: Date, default: null }, notes: { type: String, default: '' }
}, { _id: true });

const amendmentSchema = new mongoose.Schema({
  qty: { type: Number, min: 0, required: true }, reason: { type: String, required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, requestedByName: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }, requestedAt: { type: Date, default: Date.now }, decidedAt: { type: Date, default: null }
}, { _id: true });

const stageSchema = new mongoose.Schema({
  stageMasterId: { type: mongoose.Schema.Types.ObjectId, required: true }, name: { type: String, required: true }, order: { type: Number, required: true },
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, ownerName: { type: String, default: '' }, status: { type: String, default: 'Not Started' },
  estStartDate: { type: Date, default: null }, estEndDate: { type: Date, default: null }, actualStartDate: { type: Date, default: null }, actualEndDate: { type: Date, default: null }, delayDays: { type: Number, default: 0 },
  stageApprovalStatus: { type: String, enum: ['Not Submitted', 'Pending Approval', 'Approved', 'Rejected'], default: 'Not Submitted' }, tasks: { type: [taskSchema], default: [] }
}, { _id: true });

const boqSchema = new mongoose.Schema({
  item: { type: String, required: true }, qtyPlanned: { type: Number, required: true, min: 0 }, qtyUsed: { type: Number, default: 0, min: 0 }, unit: { type: String, default: 'Nos.' }, amendments: { type: [amendmentSchema], default: [] }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true, index: true }, name: { type: String, required: true, trim: true }, clientName: { type: String, default: '' }, projectType: { type: String, default: '' },
  projectManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, projectManagerName: { type: String, default: '' }, priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  estStartDate: { type: Date, default: null }, expectedCompletionDate: { type: Date, default: null }, actualStartDate: { type: Date, default: null }, closureDate: { type: Date, default: null },
  status: { type: String, enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'], default: 'Not Started' }, remarks: { type: String, default: '' },
  stages: { type: [stageSchema], default: [] }, boq: { type: [boqSchema], default: [] }, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });
export default mongoose.model('Project', projectSchema);
