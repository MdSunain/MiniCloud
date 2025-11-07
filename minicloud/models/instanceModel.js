import mongoose from 'mongoose';

const instanceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['t2.micro', 't2.medium', 't2.large'], default: 't2.micro' },
  status: { type: String, enum: ['running', 'stopped'], default: 'running' },
  ownerEmail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Instance', instanceSchema);
