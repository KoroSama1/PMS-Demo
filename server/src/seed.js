import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import User from './models/User.js';
import Stage from './models/Stage.js';
import StageStatus from './models/StageStatus.js';
import ProjectType from './models/ProjectType.js';
import Project from './models/Project.js';

const stageNames = ['LOI Received','Acceptance Letter','EMD Adjustment/Refund','WO Received','Countersign WO & Return','Performance Bank Guarantee (PBG) Submission','Advance Payment Bank Guarantee (if applicable)','Advance Payment Received (if applicable)','Site Survey','Site Survey Report','Site Specific BOQ Changes / Variation Approval','Billing of Site Survey','JE/AE Sign on Bills','EE Sign on Bills','Accounts Department','Payment of Survey Bill','Procurement','EE Approval','Manufacturing (if applicable)','Stage Inspection during Manufacturing (if applicable)','Factory Acceptance Test (FAT)','FAT Certificate Received','Material Inspection (if applicable)','Dispatch Clearance','Transit Insurance','Material Dispatch','Material Receipt Certificate at Site','Site Installation','Recording of MB','Site Installation Approval','Testing & Commissioning','Final Measurement Entry for RA Bill','Issuance of Testing & Commissioning Certificate','JE/AE Verification','Billing','Pre-Audit','EE/Accounts Sanction','Payment Received','Post-Audit','Warranty / AMC','DLP Tracking / Complaint Register Sign-off','Completion Certificate','Release of Performance Guarantee and Security Deposit','Project Closed','Project On Hold','Project Cancelled','Extension of Time (EOT) Granted','Liquidated Damages (LD) Deduction/Waiver','Survey MB recording'];
const projectTypes = ['DAM Automation','Canal Automation','SCADA Automation','AMC','JJM – Jal Jeevan Mission','AMR Water Meter','SCADA Automation & AMR Water Meter','SCADA and Flowmeter'];
const stageStatuses = ['Not Started','In Progress','On Hold','Delayed','Completed','Cancelled'];

async function upsertMany(Model, names) { for (const name of names) await Model.updateOne({ name }, { $setOnInsert: { name, active: true } }, { upsert: true }); }

async function seedUsers() {
  const hash = await bcrypt.hash('Password@123', 10); const users = {};
  const rows = [['Tender Executive','tender@example.com','Tender Executive'],['Bhushan Patil','manager@example.com','Manager'],['Avishkar','avishkar@example.com','Manager'],['Site Engineer','engineer@example.com','Site Engineer'],['Santosh Poddar','santosh@example.com','Site Engineer']];
  for (const [name,email,role] of rows) {
    const user = await User.findOneAndUpdate({ email }, { $set: { name, role, active: true }, $setOnInsert: { passwordHash: hash } }, { upsert: true, new: true, setDefaultsOnInsert: true });
    if (!user.passwordHash) { user.passwordHash = hash; await user.save(); }
    users[email] = user;
  }
  return users;
}

async function main() {
  await connectDb(); await upsertMany(Stage, stageNames); await upsertMany(StageStatus, stageStatuses); await upsertMany(ProjectType, projectTypes); const users = await seedUsers();
  if (!(await Project.exists({ projectId: 'PRJ-0001' }))) {
    const selected = ['LOI Received','WO Received','Site Survey','Procurement','Factory Acceptance Test (FAT)','Manufacturing (if applicable)','Material Dispatch','Site Installation','Testing & Commissioning','Billing','Warranty / AMC','Payment Received','Project Closed','Project On Hold','Project Cancelled'];
    const masters = await Stage.find({ name: { $in: selected } }).lean(); const byName = new Map(masters.map(x=>[x.name,x]));
    const manager = users['manager@example.com']; const engineer = users['engineer@example.com'];
    const stages = selected.map((name,index) => {
      const managerOwned = ['LOI Received','WO Received','Site Survey','Procurement','Factory Acceptance Test (FAT)','Billing'].includes(name); const owner = managerOwned ? manager : engineer;
      return { stageMasterId: byName.get(name)._id, name, order: index+1, ownerUserId: owner._id, ownerName: owner.name, status: index===0 ? 'In Progress':'Not Started', estStartDate: index===0 ? new Date('2026-09-01'):null, estEndDate: index===0 ? new Date('2026-09-15'):null, tasks: name==='Site Survey' ? [{ title:'Complete site survey documentation', description:'Capture survey data and attach documentation.', assignedTo:engineer._id, assignedToName:engineer.name, status:'In Progress' }] : [] };
    });
    await Project.create({
      projectId:'PRJ-0001', name:'DVC SCADA and Flowmeter', clientName:'DVC', projectType:'SCADA and Flowmeter', projectManagerId:manager._id, projectManagerName:manager.name, priority:'Critical', estStartDate:new Date('2026-09-01'), status:'In Progress', remarks:'Documentation process is ongoing. Target deadline needs extension for documentation.', stages,
      boq:[{item:'PLC Panel',qtyPlanned:2,qtyUsed:0,unit:'Nos.'},{item:'Ultrasonic Level Transmitter',qtyPlanned:12,qtyUsed:3,unit:'Nos.'},{item:'Server Rack & Server',qtyPlanned:1,qtyUsed:0,unit:'Set'},{item:'Software / SCADA',qtyPlanned:1,qtyUsed:0,unit:'Lot'},{item:'Electromagnetic Flowmeters – Different Sizes',qtyPlanned:8,qtyUsed:2,unit:'Nos.'}], createdBy:users['tender@example.com']._id
    });
  }
  console.log('PMS seed complete. Demo password: Password@123'); await mongoose.disconnect();
}
main().catch(async err=>{ console.error(err); await mongoose.disconnect(); process.exit(1); });
