import axios from "axios";
import apiRoutes from "@/config/apiRoutes";
import "../apiClient";
import { SupportTicketModel } from "@/app/model/SupportTicketModel";

export interface SupportTicketPayload {
    name: string;
    email: string;
    subject: string;
    description?: string;
}

class SupportService {
    static async createTicket(payload: SupportTicketPayload): Promise<{ message: string; ticket: SupportTicketModel }> {
        const res = await axios.post(apiRoutes.support.create, payload, {
            headers: { Accept: "application/json" },
        });
        return {
            message: res.data.message ?? "Request submitted successfully",
            ticket: new SupportTicketModel(res.data.ticket ?? {}),
        };
    }

    static async deleteTicket(id: string): Promise<string> {
        const res = await axios.delete(apiRoutes.support.delete(id), {
            headers: { Accept: "application/json" },
        });
        return res.data.message ?? 'Ticket deleted successfully';
    }

    static async toggleTicket(id: string): Promise<{ status: 'open' | 'resolved'; message: string }> {
        const res = await axios.patch(apiRoutes.support.toggle(id), {}, {
            headers: { Accept: "application/json" },
        });
        return {
            status:  res.data.status  ?? 'open',
            message: res.data.message ?? '',
        };
    }

    static async getAllTickets(): Promise<SupportTicketModel[]> {
        const res = await axios.get(apiRoutes.support.adminList, {
            headers: { Accept: "application/json" },
        });
        return SupportTicketModel.fromApiList(res.data.tickets ?? []);
    }
}

export default SupportService;
