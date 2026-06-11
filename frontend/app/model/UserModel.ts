/* Single profile (GET /user) */
export class UserProfileModel {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    isAccountVerified: boolean;
    isBlocked: boolean;

    constructor(raw: Record<string, any> = {}) {
        this.id = raw._id ?? raw.userId ?? null;
        this.name = raw.name ?? '';
        this.email = raw.email ?? '';
        this.role = raw.role ?? 'user';
        this.avatar = raw.avatar ?? '';
        this.isAccountVerified = raw.isAccountVerified ?? false;
        this.isBlocked = raw.isBlocked?? false;
    }

    toObjectUI() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            avatar: this.avatar,
            isAccountVerified: this.isAccountVerified,
            isBlocked: this.isAccountVerified,
        };
    }
}

/* User listing item (GET /admin/users) */
export class UserListItem {
    userId: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
    isAccountVerified: boolean;
    isBlocked: boolean;
    status: string;
    joinedAt: string;
    canBlock: boolean;

    constructor(raw: Record<string, any> = {}) {
        this.userId = raw.userId ?? null;
        this.name = raw.name ?? '';
        this.email = raw.email ?? '';
        this.role = raw.role ?? 'user';
        this.avatar = raw.avatar ?? '';
        this.isAccountVerified = raw.isAccountVerified ?? false;
        this.isBlocked = raw.isBlocked ?? false;
        this.status = raw.status ?? 'Active';
        this.joinedAt = raw.joinedAt ?? null;
        this.canBlock = raw.canBlock ?? false;
    }

    static fromApiList(list: Record<string, any>[] = []): UserListItem[] {
        if (!Array.isArray(list)) return [];
        return list.map((item) => new UserListItem(item));
    }
}
