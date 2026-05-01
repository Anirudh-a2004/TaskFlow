import Notification from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(40);
  res.json({ items });
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, _id: { $in: req.body.ids || [] } }, { read: true });
  res.json({ message: 'Notifications updated.' });
});
