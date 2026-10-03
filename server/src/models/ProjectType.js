import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: { type: String, required: true, unique: true, trim: true }, active: { type: Boolean, default: true } }, { timestamps: true });
export default mongoose.model('ProjectType', schema);
