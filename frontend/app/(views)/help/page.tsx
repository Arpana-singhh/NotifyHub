'use client';

import { useEffect } from 'react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import { Button, Input } from 'antd';
import { Formik, Form, Field, type FieldProps } from 'formik';
import { toast } from 'react-toastify';
import SupportService from '@/app/service/api/support.services';
import { useUserStore } from '@/app/store/userStore';

interface HelpFormValues {
  name: string;
  email: string;
  subject: string;
  description: string;
}

const FAQS = [
  {
    icon: 'fa-bell',
    question: 'Why am I not receiving notifications?',
    answer: 'Make sure your account is verified and not blocked. Notifications are delivered in real-time via SSE — keep the tab open.',
  },
  {
    icon: 'fa-user-lock',
    question: 'How do I reset my password?',
    answer: 'Go to the login page and click "Forgot password". Enter your registered email and follow the OTP instructions.',
  },
  {
    icon: 'fa-circle-user',
    question: 'How do I update my profile?',
    answer: 'Visit the Profile page from the sidebar. You can update your name and avatar there.',
  },
  {
    icon: 'fa-shield-halved',
    question: 'How do I verify my account?',
    answer: 'Check your registered email for a verification OTP and enter it on the verify account page.',
  },
];

function validate(values: HelpFormValues) {
  const errors: Partial<Record<keyof HelpFormValues, string>> = {};
  if (!(values.subject ?? '').trim()) errors.subject = 'Subject is required';
  return errors;
}

async function handleSubmit(
  values: HelpFormValues,
  { setSubmitting, resetForm }: { setSubmitting: (v: boolean) => void; resetForm: () => void },
) {
  try {
    const { message } = await SupportService.createTicket(values);
    toast.success(message);
    resetForm();
  } catch {
    toast.error('Failed to submit request. Please try again.');
  } finally {
    setSubmitting(false);
  }
}

export default function HelpPage() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => { fetchUser(); }, []);

  const initialValues: HelpFormValues = {
    name:        user?.name  ?? '',
    email:       user?.email ?? '',
    subject:     '',
    description: '',
  };

  return (
    <DashboardLayout>
      <div className="main-content__header">
        <h1 className="main-content__title">Help &amp; Support</h1>
      </div>

      <div className="container-fluid px-0">
        <div className="row g-4">

          {/* FAQ */}
          <div className="col-xl-5">
            <div className="nh-card cmn-card h-100">
              <div className="nh-card__body">
                <h2 className="help-section__heading">
                  <i className="fas fa-circle-question me-2" />
                  Frequently Asked Questions
                </h2>
                <div className="help-faq__list">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="help-faq__item">
                      <div className="help-faq__icon">
                        <i className={`fas ${faq.icon}`} />
                      </div>
                      <div>
                        <p className="help-faq__question">{faq.question}</p>
                        <p className="help-faq__answer">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-xl-7">
            <div className="nh-card cmn-card">
              <div className="nh-card__body">
                <h2 className="help-section__heading">
                  <i className="fas fa-headset me-2" />
                  Contact Support
                </h2>

                <Formik
                  initialValues={initialValues}
                  enableReinitialize
                  validate={validate}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>

                      {/* Name + Email side by side */}
                      <div className="row g-3">
                        <div className="col-sm-6">
                          <Field name="name">
                            {({ field }: FieldProps) => (
                              <div className="form-group ">
                                <label htmlFor="help-name">Name</label>
                                <Input
                                  {...field}
                                  id="help-name"
                                  placeholder="Your full name"
                                  readOnly
                                  variant="filled"
                                />
                                {touched.name && errors.name && (
                                  <small className="text-danger">{errors.name}</small>
                                )}
                              </div>
                            )}
                          </Field>
                        </div>
                        <div className="col-sm-6">
                          <Field name="email">
                            {({ field }: FieldProps) => (
                              <div className="form-group ">
                                <label htmlFor="help-email">Email</label>
                                <Input
                                  {...field}
                                  id="help-email"
                                  type="email"
                                  placeholder="you@example.com"
                                  readOnly
                                  variant="filled"
                                />
                              </div>
                            )}
                          </Field>
                        </div>
                      </div>

                      {/* Subject */}
                      <Field name="subject">
                        {({ field }: FieldProps) => (
                          <div className="form-group">
                            <label htmlFor="help-subject">Subject</label>
                            <Input
                              {...field}
                              id="help-subject"
                              placeholder="Brief summary of your issue"
                              status={touched.subject && errors.subject ? 'error' : ''}
                            />
                            {touched.subject && errors.subject && (
                              <small className="text-danger">{errors.subject}</small>
                            )}
                          </div>
                        )}
                      </Field>

                      {/* Description (optional) */}
                      <Field name="description">
                        {({ field }: FieldProps) => (
                          <div className="form-group">
                            <label htmlFor="help-description">
                              Description
                              <span className="help-form__optional"> (optional)</span>
                            </label>
                            <Input.TextArea
                              {...field}
                              id="help-description"
                              rows={5}
                              placeholder="Describe your issue in detail…"
                            />
                          </div>
                        )}
                      </Field>

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
                          Submit Request <i className="fas fa-paper-plane" />
                        </Button>
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
