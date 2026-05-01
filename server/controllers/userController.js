import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pagination, searchFilter } from '../utils/query.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req);
  const filter = searchFilter(['name', 'email', 'department'], req.query.search);
  const [items, total] = await Promise.all([
    User.find(filter).select('-password').sort({ name: 1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);
  res.json({ items, page, pages: Math.ceil(total / limit), total });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const fields = ['name', 'title', 'department'];
  for (const field of fields) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }
  if (req.file) req.user.avatar = `/uploads/${req.file.filename}`;
  await req.user.save();
  res.json({ user: req.user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true, runValidators: true }
  ).select('-password');
  res.json({ user });
});
