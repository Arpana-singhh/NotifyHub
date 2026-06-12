'use client';

import DashboardLayout from '@/app/components/layout/DashboardLayout';
import NotificationService from '@/app/service/api/notification.services';
import { useUserStore } from '@/app/store/userStore';
import { Button, Input, Radio, Select } from 'antd';
import { Formik, Form, Field, type FieldProps } from 'formik';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

type NotifType = 'info' | 'success' | 'warning' | 'error';
type RecipientMode = 'all' | 'select';

interface SendFormValues {
  title: string;
  message: string;
  type: NotifType;
  recipient: RecipientMode;
  selectedUserIds: string[];
}

const TYPES: { key: NotifType; label: string; icon: string }[] = [
  { key: 'info',    label: 'Info',    icon: 'fa-circle-info' },
  { key: 'success', label: 'Success', icon: 'fa-circle-check' },
  { key: 'warning', label: 'Warning', icon: 'fa-triangle-exclamation' },
  { key: 'error',   label: 'Error',   icon: 'fa-circle-xmark' },
];

const TYPE_ACTIVE: Record<NotifType, string> = {
  info:    'type-selector__option--info-active',
  success: 'type-selector__option--success-active',
  warning: 'type-selector__option--warning-active',
  error:   'type-selector__option--error-active',
};

function validate(values: SendFormValues) {
  const errors: Partial<Record<keyof SendFormValues, string>> = {};
  if (!values.title.trim())   errors.title   = 'Title is required';
  if (!values.message.trim()) errors.message = 'Message is required';
  if (values.recipient === 'select' && values.selectedUserIds.length === 0)
    errors.selectedUserIds = 'Please select at least one user';
  return errors;
}

export default function SendNotificationPage() {
  const { users, fetchAllUserByAdmin } = useUserStore();

  useEffect(() => { fetchAllUserByAdmin(); }, []);

  const selectableUsers = users.filter(u => u.role === 'user' && !u.isBlocked);
  const activeUserCount = selectableUsers.length;

  const initialValues: SendFormValues = {
    title:           '',
    message:         '',
    type:            'info',
    recipient:       'all',
    selectedUserIds: [],
  };

  async function handleSubmit(values: SendFormValues, { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void }) {
    try {
      const payload: Parameters<typeof NotificationService.createNotification>[0] = {
        title:         values.title,
        message:       values.message,
        type:          values.type,
        recipientType: values.recipient === 'all' ? 'all' : 'selected',
        ...(values.recipient === 'select' && { userIds: values.selectedUserIds }),
      };
      const response = await NotificationService.createNotification(payload);
      toast.success(response.message);
      resetForm();
    } catch {
      toast.error('Failed to send notification. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

                <Formik
                  initialValues={initialValues}
                  validate={validate}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, setFieldValue, resetForm, isSubmitting }) => (
                    <Form>

                      {/* Title */}
                      <Field name="title">
                        {({ field }: FieldProps) => (
                          <div className="form-group">
                            <label htmlFor="notif-title">Title</label>
                            <Input
                              {...field}
                              id="notif-title"
                              placeholder="Enter notification title"
                              status={touched.title && errors.title ? 'error' : ''}
                            />
                            {touched.title && errors.title && (
                              <small className="text-danger">{errors.title}</small>
                            )}
                          </div>
                        )}
                      </Field>

                      {/* Message */}
                      <Field name="message">
                        {({ field }: FieldProps) => (
                          <div className="form-group">
                            <label htmlFor="notif-message">Message</label>
                            <Input.TextArea
                              {...field}
                              id="notif-message"
                              rows={4}
                              placeholder="Enter notification message"
                              status={touched.message && errors.message ? 'error' : ''}
                            />
                            {touched.message && errors.message && (
                              <small className="text-danger">{errors.message}</small>
                            )}
                          </div>
                        )}
                      </Field>

                      {/* Notification type */}
                      <div className="form-group">
                        <label>Notification type</label>
                        <div className="type-selector">
                          {TYPES.map(t => (
                            <button
                              key={t.key}
                              type="button"
                              className={`type-selector__option${values.type === t.key ? ` ${TYPE_ACTIVE[t.key]}` : ''}`}
                              onClick={() => setFieldValue('type', t.key)}
                            >
                              <i className={`fas ${t.icon}`} />
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Recipients */}
                      <div className="form-group slct-user-btns" >
                        <label>Recipients</label>
                        <Radio.Group
                          value={values.recipient}
                          onChange={e => {
                            setFieldValue('recipient', e.target.value);
                            if (e.target.value === 'all') setFieldValue('selectedUserIds', []);
                          }}
                          className="recipient-select-button w-100"
                        >
                          <Radio value="all" className={`recipient-option${values.recipient === 'all' ? ' recipient-option--active' : ''}`}>
                            <span>
                              <i className="fas fa-users me-2" />
                              All users
                            </span>
                            <span className="recipient-option__count">{activeUserCount}</span>
                          </Radio>

                          <Radio value="select" className={`recipient-option${values.recipient === 'select' ? ' recipient-option--active' : ''}`}>
                            <span>
                              <i className="fas fa-user me-2" />
                              Select users
                            </span>
                            {values.selectedUserIds.length > 0 && (
                              <span className="recipient-option__count">{values.selectedUserIds.length}</span>
                            )}
                          </Radio>
                        </Radio.Group>
                      </div>

                      {/* User multi-select dropdown */}
                      {values.recipient === 'select' && (
                        <div className="form-group">
                          <label>Choose users</label>
                          <Select
                            mode="multiple"
                            style={{ width: '100%' }}
                            placeholder="Choose users…"
                            value={values.selectedUserIds}
                            onChange={ids => setFieldValue('selectedUserIds', ids)}
                            status={touched.selectedUserIds && errors.selectedUserIds ? 'error' : ''}
                            optionFilterProp="label"
                            options={selectableUsers.map(u => ({
                              value: u.userId,
                              label: u.name,
                            }))}
                            optionRender={option => {
                              const u = selectableUsers.find(x => x.userId === option.value);
                              if (!u) return option.label;
                              return (
                                <span className="user-dropdown__item" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 0, border: 'none', background: 'none', width: '100%' }}>
                                  <span className="user-dropdown__item-avatar">
                                    {u.avatar
                                      ? <img src={u.avatar} alt={u.name} />
                                      : <span>{u.name.charAt(0).toUpperCase()}</span>}
                                  </span>
                                  <span className="user-dropdown__item-name">{u.name}</span>
                                </span>
                              );
                            }}
                            tagRender={props => {
                              const u = selectableUsers.find(x => x.userId === props.value);
                              return (
                                <span className="user-dropdown__chip">
                                  <span className="user-dropdown__chip-avatar">
                                    {u?.avatar
                                      ? <img src={u.avatar} alt={u?.name} />
                                      : (u?.name ?? '?').charAt(0).toUpperCase()}
                                  </span>
                                  {u?.name ?? props.label}
                                  <button
                                    type="button"
                                    className="user-dropdown__chip-remove"
                                    onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
                                    onClick={props.onClose}
                                    aria-label={`Remove ${u?.name}`}
                                  >
                                    <i className="fas fa-xmark" />
                                  </button>
                                </span>
                              );
                            }}
                          />
                          {touched.selectedUserIds && errors.selectedUserIds && (
                            <small className="text-danger">{errors.selectedUserIds}</small>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="d-flex gap-3 mt-4">
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="nh-btn nh-btn--primary flex-grow-1"
                          loading={isSubmitting}
                          disabled={isSubmitting}
                          block
                        >
                          Send notification&nbsp;<i className="fas fa-paper-plane" />
                        </Button>
                        <Button
                          type="default"
                          className="nh-btn nh-btn--outline"
                          disabled={isSubmitting}
                          onClick={() => { resetForm(); }}
                        >
                          Clear
                        </Button>
                      </div>

                      {/* SSE note */}
                      <div className="sse-note mt-4">
                        <span className="sse-note__dot" />
                        Notifications are delivered instantly via SSE — no page refresh needed for recipients
                      </div>
                    </Form>
                  )}
                </Formik>

              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
