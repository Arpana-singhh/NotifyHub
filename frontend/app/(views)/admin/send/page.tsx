'use client';

import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { useUserStore } from '@/app/store/userStore';
import { Button } from 'antd';
import { useEffect, useState } from 'react';

type NotifType = 'info' | 'success' | 'warning' | 'error';
type RecipientMode = 'all' | 'select';

const TYPES: { key: NotifType; label: string; icon: string; activeClass: string }[] = [
  { key: 'info',    label: 'Info',    icon: 'fa-circle-info',         activeClass: 'type-selector__option--info-active' },
  { key: 'success', label: 'Success', icon: 'fa-circle-check',        activeClass: 'type-selector__option--success-active' },
  { key: 'warning', label: 'Warning', icon: 'fa-triangle-exclamation', activeClass: 'type-selector__option--warning-active' },
  { key: 'error',   label: 'Error',   icon: 'fa-circle-xmark',        activeClass: 'type-selector__option--error-active' },
];

export default function SendNotificationPage() {
  const [title, setTitle]         = useState('System maintenance scheduled for Sunday');
  const [message, setMessage]     = useState('We will be performing scheduled maintenance on Sunday June 8 from 2:00 AM to 4:00 AM UTC. Some features may be temporarily unavailable during this time.');
  const [type, setType]           = useState<NotifType>('info');
  const [recipient, setRecipient] = useState<RecipientMode>('all');
  const [sent, setSent]           = useState(false);
  const { users, isLoadingUsers, fetchAllUserByAdmin, toggleBlock } = useUserStore();

  useEffect(() => {
    fetchAllUserByAdmin();
  }, []);

  function handleSend() {
    if (!title.trim() || !message.trim()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  function handleClear() {
    setTitle('');
    setMessage('');
    setType('info');
    setRecipient('all');
  }

  return (
    <DashboardLayout isAdmin userName="Admin User" userInitials="AU">
      <div className="main-content__header">
        <h1 className="main-content__title">Create Notification</h1>
      </div>

      <div className="container-fluid px-0">
        <div className="row justify-content-start">
          <div className="col-xl-8 mx-auto">
            <div className="nh-card cmn-card">
              <div className="nh-card__body">

                {sent && (
                  <div className="sse-note mb-4" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>
                    <span className="sse-note__dot" />
                    Notification sent successfully to {recipient === 'all' ? 'all 142 users' : 'selected users'}!
                  </div>
                )}

                {/* Title */}
                <div className="form-group">
                  <label htmlFor="notif-title">Title</label>
                  <input
                    id="notif-title"
                    type="text"
                    className="nh-input"
                    placeholder="Enter notification title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="form-group">
                  <label htmlFor="notif-message">Message</label>
                  <textarea
                    id="notif-message"
                    className="nh-input"
                    rows={4}
                    placeholder="Enter notification message"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </div>

                {/* Type & Recipients row */}
                <div className="container-fluid px-0">
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="form-group mb-0">
                        <label>Notification type</label>
                        <div className="type-selector">
                          {TYPES.map(t => (
                            <button
                              key={t.key}
                              type="button"
                              className={`type-selector__option${type === t.key ? ` ${t.activeClass}` : ''}`}
                              onClick={() => setType(t.key)}
                            >
                              <i className={`fas ${t.icon}`} />
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group mb-0">
                        <label>Recipients</label>
                        <div className="recipient-select-button">
                          <Button
                            type="default"
                            className={`recipient-option${recipient === 'all' ? ' recipient-option--active' : ''}`}
                            onClick={() => setRecipient('all')}
                          >
                            <span>
                              <i className="fas fa-users me-2" />
                              All users
                            </span>
                            <span className="recipient-option__count">142</span>
                          </Button>

                          <Button
                            type="default"
                            className={`recipient-option${recipient === 'select' ? ' recipient-option--active' : ''}`}
                            onClick={() => setRecipient('select')}
                          >
                            <span>
                              <i className="fas fa-user me-2" />
                              Select users
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-3 mt-4">
                  <button
                    type="button"
                    className="nh-btn nh-btn--primary flex-grow-1"
                    onClick={handleSend}
                    disabled={!title.trim() || !message.trim()}
                  >
                    Send notification&nbsp;<i className="fas fa-paper-plane" />
                  </button>
                  <button type="button" className="nh-btn nh-btn--outline" onClick={handleClear}>
                    Clear
                  </button>
                </div>

                {/* SSE note */}
                <div className="sse-note mt-4">
                  <span className="sse-note__dot" />
                  Notifications are delivered instantly via SSE — no page refresh needed for recipients
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
