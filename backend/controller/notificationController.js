import notificationModel from '../models/notificationModel.js';
import notificationRecipientModel from '../models/notificationRecipientModel.js';
import userModel from '../models/userModel.js';

export const createNotification = async (req, res) => {
    const { title, message, type, recipientType, recipientIds } = req.body;

    if (!title || !message || !recipientType) {
        return res.status(400).json({ success: false, message: "title, message and recipientType are required" });
    }

    try {
        let targetUserIds = [];

        if (recipientType === 'all') {
            const users = await userModel.find({ role: 'user', isBlocked: false }).select('_id');
            targetUserIds = users.map((u) => u._id);
        } else if (recipientType === 'selected') {
            if (!recipientIds || recipientIds.length === 0) {
                return res.status(400).json({ success: false, message: "recipientIds are required for selected type" });
            }
            targetUserIds = recipientIds;
        } else {
            return res.status(400).json({ success: false, message: "recipientType must be 'all' or 'selected'" });
        }

        const notification = await notificationModel.create({
            title,
            message,
            type: type || 'info',
            createdBy: req.userId,
        });

        const recipients = targetUserIds.map((userId) => ({
            notificationId: notification._id,
            recipient: userId,
        }));

        await notificationRecipientModel.insertMany(recipients);

        return res.status(201).json({
            success: true,
            message: `Notification sent to ${targetUserIds.length} user(s) successfully`,
        });
    } catch (error) {
        console.error("CREATE NOTIFICATION ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const adminDeleteNotification = async (req, res) => {
    try {
        const notification = await notificationModel.findByIdAndDelete(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        await notificationRecipientModel.deleteMany({ notificationId: req.params.id });

        return res.status(200).json({
            success: true,
            message: "Notification permanently deleted",
        });
    } catch (error) {
        console.error("ADMIN DELETE NOTIFICATION ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const recipients = await notificationRecipientModel
            .find({ recipient: req.userId, isDeletedByUser: false })
            .populate('notificationId')
            .sort({ createdAt: -1 });

        const notifications = recipients.map((r) => ({
            _id: r._id,
            isRead: r.isRead,
            isDeletedByUser: r.isDeletedByUser,
            createdAt: r.createdAt,
            notification: r.notificationId,
        }));

        return res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            notifications,
        });
    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getNotificationById = async (req, res) => {
    try {
        const recipient = await notificationRecipientModel
            .findOne({ _id: req.params.id, recipient: req.userId, isDeletedByUser: false })
            .populate('notificationId');

        if (!recipient) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Notification fetched successfully",
            notification: {
                _id: recipient._id,
                isRead: recipient.isRead,
                isDeletedByUser: recipient.isDeletedByUser,
                createdAt: recipient.createdAt,
                notification: recipient.notificationId,
            },
        });
    } catch (error) {
        console.error("GET NOTIFICATION BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const recipient = await notificationRecipientModel.findOne({
            _id: req.params.id,
            recipient: req.userId,
            isDeletedByUser: false,
        });

        if (!recipient) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (recipient.isRead) {
            return res.status(400).json({ success: false, message: "Notification is already read" });
        }

        recipient.isRead = true;
        await recipient.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    } catch (error) {
        console.error("MARK AS READ ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await notificationRecipientModel.countDocuments({
            recipient: req.userId,
            isRead: false,
            isDeletedByUser: false,
        });

        return res.status(200).json({
            success: true,
            unreadCount: count,
        });
    } catch (error) {
        console.error("UNREAD COUNT ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const recipient = await notificationRecipientModel.findOne({
            _id: req.params.id,
            recipient: req.userId,
        });

        if (!recipient) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        recipient.isDeletedByUser = true;
        await recipient.save();

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        console.error("DELETE NOTIFICATION ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
