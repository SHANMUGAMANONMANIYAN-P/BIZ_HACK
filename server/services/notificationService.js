const Notification = require('../models/Notification');

const createNotification = async ({
  userId,
  type,
  message,
  requestId = null,
  circleId = null,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      message,
      requestId,
      circleId,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

module.exports = { createNotification };
