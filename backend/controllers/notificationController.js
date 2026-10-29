import Notification from '../models/Notification.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      success: true,
      notifications: notifications.map((n) => n.toJSON()),
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }

    notif.read = true;
    await notif.save();

    res.json({ success: true, message: 'Notification marked as read.', notification: notif.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const dismissNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    res.json({ success: true, message: 'Notification dismissed.' });
  } catch (error) {
    next(error);
  }
};

