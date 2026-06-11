'use client';

import { useEffect, useState } from 'react';
import { Input, Select, Button } from 'antd';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Avatar from '../../../components/common/Avatar';
import Badge from '../../../components/common/Badge';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { useUserStore } from '@/app/store/userStore';
import type { UserListItem } from '@/app/model/UserModel';

const AVATAR_COLORS = ['purple', 'blue', 'teal'] as const;

function formatJoinedDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UserManagementPage() {
  const { users, isLoadingUsers, fetchAllUserByAdmin, toggleBlock } = useUserStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [blockTarget, setBlockTarget] = useState<UserListItem | null>(null);

  const handleConfirmBlock = async () => {
    if (!blockTarget) return;
    await toggleBlock(blockTarget.userId);
    setBlockTarget(null);
  };

  useEffect(() => {
    fetchAllUserByAdmin();
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (q) return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return true;
  });

  return (
    <DashboardLayout isAdmin userName="Admin User" userInitials="AU">
      <div className="main-content__header">
        <h1 className="main-content__title">User Management</h1>
      </div>

      {/* Toolbar */}
      <div className="toolbar mb-4">
        <Input.Search
          placeholder="Search users..."
          style={{ maxWidth: 320 }}
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={(val) => setSearchQuery(val)}
        />
        <Select
          value={roleFilter}
          style={{ width: 130 }}
          onChange={(val) => setRoleFilter(val)}
          options={[
            { value: 'all',   label: 'All roles' },
            { value: 'user',  label: 'User' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
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
              {isLoadingUsers && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    <i className="fas fa-spinner fa-spin me-2" />
                    Loading users...
                  </td>
                </tr>
              )}

              {!isLoadingUsers && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No users found
                  </td>
                </tr>
              )}

              {!isLoadingUsers && filteredUsers.map((u, i) => (
                <tr key={u.userId}>
                  <td>
                    <div className="data-table__user-cell">
                      <Avatar
                        initials={u.name ? u.name.charAt(0).toUpperCase() : '?'}
                        src={u.avatar || undefined}
                        size="sm"
                        color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                      />
                      <span className="data-table__user-name">{u.name}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Badge variant={u.role === 'admin' ? 'role-admin' : 'role-user'}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={u.isBlocked ? 'blocked' : 'active'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td>{formatJoinedDate(u.joinedAt)}</td>
                  <td>
                    <Button
                      size="small"
                      danger={!u.isBlocked}
                      disabled={!u.canBlock}
                      title={!u.canBlock ? 'Admins cannot be blocked' : undefined}
                      onClick={() => setBlockTarget(u)}
                      className="block-btn"
                    >
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!blockTarget}
        title={blockTarget?.isBlocked ? 'Unblock user' : 'Block user'}
        message={
          blockTarget?.isBlocked
            ? `Are you sure you want to unblock ${blockTarget?.name}? They will regain access to their account.`
            : `Are you sure you want to block ${blockTarget?.name}? They will no longer be able to log in.`
        }
        okText={blockTarget?.isBlocked ? 'Unblock' : 'Block'}
        onConfirm={handleConfirmBlock}
        onCancel={() => setBlockTarget(null)}
      />
    </DashboardLayout>
  );
}
