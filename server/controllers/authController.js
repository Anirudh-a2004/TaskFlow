import crypto from 'crypto';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/email.js';
import { signToken } from '../utils/tokens.js';

const publicUser = '-password -resetPasswordToken -resetPasswordExpires';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, inviteCode, role: requestedRole } = req.body;
  if (!name?.trim() || !email?.trim() || !password?.trim()) {
    throw new ApiError(400, 'Name, email, and password are required.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new ApiError(409, 'Email is already registered.');

  let role = 'Member';
  const wantsAdmin = Boolean(inviteCode);

  if (wantsAdmin) {
    if (!process.env.ADMIN_INVITE_CODE) {
      throw new ApiError(500, 'Admin invite code is not configured.');
    }
    if (inviteCode !== process.env.ADMIN_INVITE_CODE) {
      throw new ApiError(403, 'Invalid admin invite code.');
    }
    role = 'Admin';
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role
  });

  const safeUser = await User.findById(user._id).select(publicUser);
  console.log(`User registered: ${normalizedEmail} (${role})`);
  res.status(201).json({ token: signToken(user), user: safeUser });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim()) {
    throw new ApiError(400, 'Email and password are required.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password.');
  if (user.isLocked()) throw new ApiError(423, 'Account is temporarily locked.');

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 1000 * 60 * 15);
    }
    await user.save();
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (user.status !== 'Active') throw new ApiError(403, 'This account is not active.');

  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLoginAt = new Date();
  user.lastLoginIp = req.ip;
  await user.save();

  const safeUser = await User.findById(user._id).select(publicUser);
  console.log(`User logged in: ${normalizedEmail}`);
  res.json({ token: signToken(user), user: safeUser });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const rawToken = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();
    await sendEmail({
      to: user.email,
      subject: 'Reset your Team Task Manager password',
      text: `Use this reset token within 30 minutes: ${rawToken}`
    });
  }
  res.json({ message: 'If the account exists, reset instructions were sent.' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token.');
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password reset successful.' });
});
