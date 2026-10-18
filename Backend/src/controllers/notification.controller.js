import mongoose from "mongoose";
import NotificationModel from "../models/notification.model.js";

/**
 * @desc    Get current user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.find({
      recipient: req.user._id,
    })
      .populate("sender", "name email avatar username")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await NotificationModel.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
      data: notifications,
    });
  } catch (error) {
    console.error("getNotifications error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error fetching notifications",
    });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID format",
      });
    }

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
      data: notification,
    });
  } catch (error) {
    console.error("markNotificationAsRead error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error marking notification as read",
    });
  }
};

/**
 * @desc    Mark all user's notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await NotificationModel.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("markAllNotificationsAsRead error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error marking all notifications as read",
    });
  }
};
