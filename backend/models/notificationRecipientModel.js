import mongoose from 'mongoose';

const notificationRecipientSchema = new mongoose.Schema(
    {
        notificationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notification',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isDeletedByUser: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

notificationRecipientSchema.index({ userId: 1, isDeletedByUser: 1 });
notificationRecipientSchema.index({ userId: 1, isRead: 1 });
notificationRecipientSchema.index({ notificationId: 1 });

const notificationRecipientModel =
    mongoose.models.NotificationRecipient ||
    mongoose.model('NotificationRecipient', notificationRecipientSchema);

export default notificationRecipientModel;
