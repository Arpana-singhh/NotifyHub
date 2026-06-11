import notificationModel from '../models/notificationModel.js';
import notificationRecipientModel from '../models/notificationRecipientModel.js';
import userModel from '../models/userModel.js';

export const createNotification = async (req, res) => {
    const { title, message, type, recipientType, userIds } = req.body;

    if (!title || !message || !recipientType) {
        return res.status(400).json({ success: false, message: "title, message and recipientType are required" });
    }

    try {
        let targetUserIds = [];

        if (recipientType === 'all') {
            const users = await userModel.find({ role: 'user', isBlocked: false }).select('_id');
            targetUserIds = users.map((u) => u._id);
        } else if (recipientType === 'selected') {
            if (!userIds || userIds.length === 0) {
                return res.status(400).json({ success: false, message: "userIds are required for selected type" });
            }
            targetUserIds = userIds;
        } else {
            return res.status(400).json({ success: false, message: "recipientType must be 'all' or 'selected'" });
        }

        const notification = await notificationModel.create({
            title,
            message,
            type: type || 'info',
            createdBy: req.userId,
        });

        const records = targetUserIds.map((userId) => ({
            notificationId: notification._id,
            userId,
        }));

        await notificationRecipientModel.insertMany(records);

        return res.status(201).json({
            success: true,
            message: `Notification sent to ${targetUserIds.length} user(s) successfully`,
        });
    } catch (error) {
        console.error("CREATE NOTIFICATION ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const adminGetDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalNotifications, readNotifications, unreadNotifications] = await Promise.all([
            userModel.countDocuments({ role: 'user', isBlocked: false }),
            notificationRecipientModel.countDocuments({ isDeletedByUser: false }),
            notificationRecipientModel.countDocuments({ isRead: true, isDeletedByUser: false }),
            notificationRecipientModel.countDocuments({ isRead: false, isDeletedByUser: false }),
        ]);

        return res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                notifications: {
                    total: totalNotifications,
                    read: readNotifications,
                    unread: unreadNotifications,
                },
            },
        });
    } catch (error) {
        console.error("ADMIN DASHBOARD STATS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const adminGetAllNotifications = async (req, res) => {
    try {
        const records = await notificationRecipientModel
            .find()
            .populate('notificationId')
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });

        const recipientMap = new Map();

        for (const r of records) {
            const user = r.userId;
            if (!user) continue;

            const uid = user._id.toString();

            if (!recipientMap.has(uid)) {
                recipientMap.set(uid, {
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    notifications: [],
                });
            }

            const notif = r.notificationId;
            if (!notif) continue;

            recipientMap.get(uid).notifications.push({
                notificationId: notif._id,
                title: notif.title,
                message: notif.message,
                type: notif.type,
                isRead: r.isRead,
                isDeletedByUser: r.isDeletedByUser,
                createdBy: notif.createdBy,
                createdAt: notif.createdAt,
                updatedAt: notif.updatedAt,
            });
        }

        const recipients = Array.from(recipientMap.values());

        return res.status(200).json({
            success: true,
            message: "All notifications fetched successfully",
            total: records.length,
            recipients,
        });
    } catch (error) {
        console.error("ADMIN GET ALL NOTIFICATIONS ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const adminDeleteNotification = async (req, res) => {
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({ success: false, message: "notificationIds array is required" });
    }

    try {
        const { deletedCount } = await notificationModel.deleteMany({ _id: { $in: notificationIds } });
        await notificationRecipientModel.deleteMany({ notificationId: { $in: notificationIds } });

        return res.status(200).json({
            success: true,
            message: `${deletedCount} notification(s) permanently deleted`,
            deletedNotificationIds: notificationIds,
        });
    } catch (error) {
        console.error("ADMIN DELETE NOTIFICATION ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const adminDeleteUserNotification = async (req, res) => {
    const { userId, notificationId } = req.body;

    if (!userId || !notificationId) {
        return res.status(400).json({ success: false, message: "userId and notificationId are required" });
    }

    try {
        const record = await notificationRecipientModel.findOne({ userId, notificationId });

        if (!record) {
            return res.status(404).json({ success: false, message: "Notification not found for this user" });
        }

        await record.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Notification deleted for the specified user",
        });
    } catch (error) {
        console.error("ADMIN DELETE USER NOTIFICATION ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const records = await notificationRecipientModel
            .find({ userId: req.userId, isDeletedByUser: false })
            .populate('notificationId')
            .sort({ createdAt: -1 });

        const notifications = records.map((r) => ({
            userNotificationId: r._id,
            isRead: r.isRead,
            isDeletedByUser: r.isDeletedByUser,
            createdAt: r.createdAt,
            notification: {
                notificationId: r.notificationId?._id,
                title: r.notificationId?.title,
                message: r.notificationId?.message,
                type: r.notificationId?.type,
                createdBy: r.notificationId?.createdBy,
                createdAt: r.notificationId?.createdAt,
                updatedAt: r.notificationId?.updatedAt,
            },
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
        const record = await notificationRecipientModel
            .findOne({ _id: req.params.id, userId: req.userId, isDeletedByUser: false })
            .populate('notificationId');

        if (!record) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Notification fetched successfully",
            notification: {
                userNotificationId: record._id,
                isRead: record.isRead,
                isDeletedByUser: record.isDeletedByUser,
                createdAt: record.createdAt,
                notification: {
                    notificationId: record.notificationId?._id,
                    title: record.notificationId?.title,
                    message: record.notificationId?.message,
                    type: record.notificationId?.type,
                    createdBy: record.notificationId?.createdBy,
                    createdAt: record.notificationId?.createdAt,
                    updatedAt: record.notificationId?.updatedAt,
                },
            },
        });
    } catch (error) {
        console.error("GET NOTIFICATION BY ID ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const record = await notificationRecipientModel.findOne({
            _id: req.params.id,
            userId: req.userId,
            isDeletedByUser: false,
        });

        if (!record) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (record.isRead) {
            return res.status(400).json({ success: false, message: "Notification is already read" });
        }

        record.isRead = true;
        await record.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
        });
    } catch (error) {
        console.error("MARK AS READ ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getCount = async (req, res) => {
    try {
        const [total, read, unread] = await Promise.all([
            notificationRecipientModel.countDocuments({ userId: req.userId, isDeletedByUser: false }),
            notificationRecipientModel.countDocuments({ userId: req.userId, isRead: true, isDeletedByUser: false }),
            notificationRecipientModel.countDocuments({ userId: req.userId, isRead: false, isDeletedByUser: false }),
        ]);

        return res.status(200).json({
            success: true,
            total,
            read,
            unread,
        });
    } catch (error) {
        console.error("GET COUNT ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const record = await notificationRecipientModel.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!record) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        record.isDeletedByUser = true;
        await record.save();

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error) {
        console.error("DELETE NOTIFICATION ERROR:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
