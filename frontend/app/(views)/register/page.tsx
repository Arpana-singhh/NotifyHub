'use client';

import Link from 'next/link';
import { Formik, Form } from 'formik';
import { Input } from 'antd';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import AuthService from '@/app/service/api/auth.services';
import ClientOnly from '@/app/components/common/ClientOnly';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [loading, setLoading]= useState(false);
  const router = useRouter();

const handleSubmit = async (values: {name: string; email: string; password: string; confirm: string;}) => {
  try {
    setLoading(true);

    const response = await AuthService.register(values.name, values.email, values.password);
    toast.success(response.data.message || "Account created successfully");
    router.push("/verify-account");

  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const errorMessage = axiosError.response?.data?.message || axiosError.message || "Registration failed";

    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-layout">
      <div className="auth-layout__bar">Authentication — Register</div>
      <div className="auth-layout__main">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
              <div className="auth-layout__card">
                <div className="auth-layout__brand">
                  <div className="auth-layout__brand-title">
                    <i className="fas fa-bell" />
                    NotifyHub
                  </div>
                  <div className="auth-layout__brand-sub">Create your account</div>
                </div>

                <ClientOnly>
                <Formik
                  initialValues={{ name: '', email: '', password: '', confirm: '' }}
                  validate={(values) => {
                    const errors: Record<string, string> = {};
                    if (!values.name) errors.name = 'Full name is required';
                    if (!values.email) errors.email = 'Email is required';
                    else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Invalid email';
                    if (!values.password) errors.password = 'Password is required';
                    else if (values.password.length < 8) errors.password = 'Minimum 8 characters';
                    if (!values.confirm) errors.confirm = 'Please confirm your password';
                    else if (values.confirm !== values.password) errors.confirm = 'Passwords do not match';
                    return errors;
                  }}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, handleChange, handleBlur }) => (
                    <Form>
                      <div className="form-group">
                        <label htmlFor="name">Full name</label>
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={values.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          status={touched.name && errors.name ? 'error' : ''}
                        />
                        {touched.name && errors.name && (
                          <small className="text-danger">{errors.name}</small>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          status={touched.email && errors.email ? 'error' : ''}
                        />
                        {touched.email && errors.email && (
                          <small className="text-danger">{errors.email}</small>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <Input.Password
                          id="password"
                          placeholder="Enter your password"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          status={touched.password && errors.password ? 'error' : ''}
                        />
                        {touched.password && errors.password && (
                          <small className="text-danger">{errors.password}</small>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="confirm">Confirm password</label>
                        <Input.Password
                          id="confirm"
                          placeholder="Confirm your password"
                          value={values.confirm}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          status={touched.confirm && errors.confirm ? 'error' : ''}
                        />
                        {touched.confirm && errors.confirm && (
                          <small className="text-danger">{errors.confirm}</small>
                        )}
                      </div>

                      <button type="submit" className="nh-btn nh-btn--secondary nh-btn--full mb-3" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                      </button>

                      <p className="text-center fs-sm text-muted-color">
                        Already have an account?{' '}
                        <Link href="/login">Sign in</Link>
                      </p>
                    </Form>
                  )}
                </Formik>
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


