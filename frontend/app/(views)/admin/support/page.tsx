'use client';

import { useEffect, useState } from 'react';
import { Button, Input, Select, Tooltip } from 'antd';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import Badge from '@/app/components/common/Badge';
import ConfirmModal from '@/app/components/common/ConfirmModal';
import SupportService from '@/app/service/api/support.services';
import type { SupportTicketModel } from '@/app/model/SupportTicketModel';
import { toast } from 'react-toastify';

function formatDate(value: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toggleTarget, setToggleTarget] = useState<SupportTicketModel | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SupportTicketModel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    SupportService.getAllTickets()
      .then(setTickets)
      .finally(() => setIsLoading(false));
  }, []);

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      const { status, message } = await SupportService.toggleTicket(toggleTarget.id);
      setTickets(prev =>
        prev.map(t => t.id === toggleTarget.id ? { ...t, status } : t)
      );
      toast.success(message);
    } catch {
      toast.error('Failed to update ticket status.');
    } finally {
      setIsToggling(false);
      setToggleTarget(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const message = await SupportService.deleteTicket(deleteTarget.id);
      setTickets(prev => prev.filter(t => t.id !== deleteTarget.id));
      toast.success(message);
    } catch {
      toast.error('Failed to delete ticket.');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout isAdmin userName="Admin User" userInitials="AU">
      <div className="main-content__header">
        <h1 className="main-content__title">Support Tickets</h1>
      </div>

      {/* Toolbar */}
      <div className="toolbar mb-4">
        <Input.Search
          placeholder="Search by name, email or subject..."
          style={{ maxWidth: 360 }}
          allowClear
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={(val) => setSearchQuery(val)}
        />
        <Select
          value={statusFilter}
          style={{ width: 130 }}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: 'all',      label: 'All status' },
            { value: 'open',     label: 'Open' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
      </div>

      <div className="nh-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    <i className="fas fa-spinner fa-spin me-2" />
                    Loading tickets...
                  </td>
                </tr>
              )}

              {!isLoading && filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No support tickets found
                  </td>
                </tr>
              )}

              {!isLoading && filteredTickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.subject}</td>
                  <td>
                    {t.description ? (
                      <Tooltip title={t.description} placement="topLeft">
                        <span className="data-table__truncate">
                          {t.description}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <Tooltip title={t.status === 'open' ? 'Click to mark resolved' : 'Click to reopen'} placement="top">
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => setToggleTarget(t)}
                      >
                        <Badge variant={t.status === 'open' ? 'ticket-open' : 'ticket-resolved'}>
                          {t.status === 'open' ? 'Open' : 'Resolved'}
                        </Badge>
                      </span>
                    </Tooltip>
                  </td>
                  <td>{formatDate(t.createdAt)}</td>
                  <td>
                    <Tooltip title="Delete ticket" placement="top">
                      <Button
                        type="text"
                        danger
                        icon={<i className="fas fa-trash-can" />}
                        aria-label="Delete"
                        onClick={() => setDeleteTarget(t)}
                       />
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!toggleTarget}
        title={toggleTarget?.status === 'open' ? 'Mark as Resolved' : 'Reopen Ticket'}
        message={
          toggleTarget?.status === 'open'
            ? `Mark "${toggleTarget?.subject}" as resolved?`
            : `Reopen "${toggleTarget?.subject}"?`
        }
        okText={toggleTarget?.status === 'open' ? 'Mark Resolved' : 'Reopen'}
        danger={false}
        confirmLoading={isToggling}
        onConfirm={handleConfirmToggle}
        onCancel={() => setToggleTarget(null)}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Ticket"
        message={`Are you sure you want to delete the ticket "${deleteTarget?.subject}"? This cannot be undone.`}
        okText="Delete"
        confirmLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}
