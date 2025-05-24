import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js"; // Note the .js extension
import User from "../models/User.js";

// @desc    Create a new notification
// @param   userId: ID of the user to notify
// @param   message: The notification message
// @param   link: Optional link to navigate to when notification is clicked
// @access  Internal (called by other controllers)
export const createNotification = async (userId, message, link = null) => {
  try {
    // Basic validation to ensure a user ID and message are provided
    if (!userId || !message) {
      console.error(
        "Error creating notification: userId and message are required."
      );
      return;
    }

    // Optional: You could add a check here to ensure the userId exists
    // const userExists = await User.findById(userId);
    // if (!userExists) {
    //   console.warn(`Attempted to create notification for non-existent user: ${userId}`);
    //   return;
    // }

    const notification = await Notification.create({
      user: userId,
      message,
      link,
    });
    // console.log('Notification created:', notification); // For debugging

    // In a real-time scenario, you'd also emit a socket.io event here
    // However, since this function is called internally, we'll assume the
    // calling controller handles the socket emission for immediate feedback.
    // For persistent notifications, just saving to DB is enough.
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

// @desc    Get current user's notifications
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(20); // Limit to a reasonable number of recent notifications

  res
    .status(200)
    .json({ success: true, count: notifications.length, data: notifications });
});

// @desc    Mark a notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  // Ensure the notification belongs to the authenticated user
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this notification");
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

// @desc    Mark all current user's notifications as read
// @route   PUT /api/v1/notifications/mark-all-read
// @access  Private
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  );

  res
    .status(200)
    .json({ success: true, message: "All notifications marked as read" });
});

// @desc    Delete a notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  // Ensure the notification belongs to the authenticated user
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this notification");
  }

  await notification.remove(); // Mongoose 6+ .remove()
  // For Mongoose 7+, consider await Notification.deleteOne({ _id: req.params.id });

  res.status(200).json({ success: true, message: "Notification removed" });
});

// Export the createNotification function separately for internal use
// The other functions are directly exported for use in routes
