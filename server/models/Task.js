import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    size: Number,
    type: String
  },
  { _id: false }
);

const subtaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', maxlength: 1500 },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Todo', 'In Progress', 'Review', 'Completed'], default: 'Todo' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    dueDate: Date,
    labels: [{ type: String }],
    attachments: [attachmentSchema],
    subtasks: [subtaskSchema],
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

taskSchema.index({ title: 'text', description: 'text', labels: 'text' });

export default mongoose.model('Task', taskSchema);
