import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
    avatar: { type: String, default: '' },
    title: { type: String, default: 'Team Member' },
    department: { type: String, default: 'Product' },
    status: { type: String, enum: ['Active', 'Blocked', 'Deactivated'], default: 'Active' },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    lastLoginAt: Date,
    lastLoginIp: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.isLocked = function isLocked() {
  return this.lockedUntil && this.lockedUntil > new Date();
};

export default mongoose.model('User', userSchema);
