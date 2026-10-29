import prisma from '../config/prisma.js';
import { formatNotification } from '../utils/formatters.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({
      success: true,
      notifications: notifications.map(formatNotification),
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notif = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        recipientId: req.user.id
      }
    });

    if (!notif) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id: notif.id },
      data: { read: true }
    });

    res.json({ success: true, message: 'Notification marked as read.', notification: formatNotification(updated) });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.user.id, read: false },
      data: { read: true }
    });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const dismissNotification = async (req, res, next) => {
  try {
    const notif = await prisma.notification.findFirst({
      where: {
        id: req.params.id,
        recipientId: req.user.id
      }
    });

    if (notif) {
      await prisma.notification.delete({
        where: { id: notif.id }
      });
    }

    res.json({ success: true, message: 'Notification dismissed.' });
  } catch (error) {
    next(error);
  }
};
