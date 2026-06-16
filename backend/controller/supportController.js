import supportTicketModel from '../models/supportTicketModel.js';

export const createSupportTicket = async (req, res) => {
    const { name, email, subject, description } = req.body;

    if (!name || !email || !subject) {
        return res.status(400).json({ success: false, message: 'Name, email, and subject are required' });
    }

    try {
        const ticket = await supportTicketModel.create({ name, email, subject, description });

        return res.status(201).json({
            success: true,
            message: "Your request has been submitted. We'll get back to you shortly!",
            ticket,
        });
    } catch (error) {
        console.error('CREATE SUPPORT TICKET ERROR:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleSupportTicket = async (req, res) => {
    try {
        const ticket = await supportTicketModel.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.status = ticket.status === 'open' ? 'resolved' : 'open';
        await ticket.save();

        return res.status(200).json({
            success: true,
            message: ticket.status === 'resolved' ? 'Ticket marked as resolved' : 'Ticket reopened',
            status: ticket.status,
        });
    } catch (error) {
        console.error('TOGGLE SUPPORT TICKET ERROR:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteSupportTicket = async (req, res) => {
    try {
        const ticket = await supportTicketModel.findByIdAndDelete(req.params.id);

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        return res.status(200).json({
            success: true,
            message: 'Support ticket deleted successfully',
        });
    } catch (error) {
        console.error('DELETE SUPPORT TICKET ERROR:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllSupportTickets = async (_req, res) => {
    try {
        const tickets = await supportTicketModel.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Support tickets fetched successfully',
            tickets,
        });
    } catch (error) {
        console.error('GET SUPPORT TICKETS ERROR:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
