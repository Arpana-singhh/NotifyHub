import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error'],
            default: 'info',
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        createdBy: {
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

const notificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export default notificationModel;
