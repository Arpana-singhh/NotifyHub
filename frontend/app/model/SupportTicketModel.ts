export class SupportTicketModel {
    id: string;
    name: string;
    email: string;
    subject: string;
    description: string;
    status: 'open' | 'resolved';
    createdAt: string;
    updatedAt: string;

    constructor(raw: Record<string, any> = {}) {
        this.id          = raw._id ?? '';
        this.name        = raw.name ?? '';
        this.email       = raw.email ?? '';
        this.subject     = raw.subject ?? '';
        this.description = raw.description ?? '';
        this.status      = raw.status ?? 'open';
        this.createdAt   = raw.createdAt ?? '';
        this.updatedAt   = raw.updatedAt ?? '';
    }

    static fromApiList(list: Record<string, any>[] = []): SupportTicketModel[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => new SupportTicketModel(item));
    }
}
