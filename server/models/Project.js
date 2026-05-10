import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 800 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deadline: Date,
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    color: { type: String, default: '#2563eb' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['Active', 'In Progress', 'Completed', 'Archived'], default: 'Active' },
    completionReadyAt: Date,
    completedAt: Date,
    archived: { type: Boolean, default: false },
    archivedAt: Date
  },
  { timestamps: true }
);

projectSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Project', projectSchema);
