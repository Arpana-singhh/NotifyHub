import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['open', 'resolved'],
            default: 'open',
        },
    },
    {
        timestamps: true,
    }
);

const supportTicketModel = mongoose.models.SupportTicket || mongoose.model('SupportTicket', supportTicketSchema);

export default supportTicketModel;
