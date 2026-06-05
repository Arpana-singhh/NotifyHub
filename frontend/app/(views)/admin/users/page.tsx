import DashboardLayout from '../../../components/layout/DashboardLayout';
import Avatar from '../../../components/common/Avatar';
import Badge from '../../../components/common/Badge';

const USERS = [
  {
    initials: 'JS',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User' as const,
    status: 'Active' as const,
    joined: 'Mar 12, 2025',
    color: 'purple' as const,
    canBlock: true,
  },
  {
    initials: 'MR',
    name: 'Mike Ross',
    email: 'mike@example.com',
    role: 'User' as const,
    status: 'Blocked' as const,
    joined: 'Apr 3, 2025',
    color: 'blue' as const,
    canBlock: false,
  },
  {
    initials: 'AL',
    name: 'Amy Lin',
    email: 'amy@example.com',
    role: 'Admin' as const,
    status: 'Active' as const,
    joined: 'Jan 9, 2025',
    color: 'teal' as const,
    canBlock: true,
  },
];

export default function UserManagementPage() {
  return (
    <DashboardLayout isAdmin userName="Admin User" userInitials="AU">
      <div className="main-content__header">
        <h1 className="main-content__title">User Management</h1>
      </div>

      {/* Toolbar */}
      <div className="toolbar mb-4">
        <div className="search-wrap flex-grow-1" style={{ maxWidth: 320 }}>
          <i className="fas fa-search search-icon" />
          <input
            type="text"
            className="nh-input nh-input--search"
            placeholder="Search users..."
          />
        </div>
        <select className="nh-select">
          <option>All roles</option>
          <option>User</option>
          <option>Admin</option>
        </select>
      </div>

      <div className="nh-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div className="data-table__user-cell">
                      <Avatar initials={u.initials} size="sm" color={u.color} />
                      <span className="data-table__user-name">{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Badge variant={u.role === 'Admin' ? 'role-admin' : 'role-user'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={u.status === 'Active' ? 'active' : 'blocked'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td>{u.joined}</td>
                  <td>
                    <button className="nh-btn nh-btn--outline nh-btn--sm">
                      {u.canBlock ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
