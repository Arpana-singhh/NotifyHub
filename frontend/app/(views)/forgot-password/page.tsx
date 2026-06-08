'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Formik, Form } from 'formik';
import { Input } from 'antd';
import AuthLayout from '../../components/layout/AuthLayout';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import AuthService from '@/app/service/api/auth.services';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'forgot' | 'reset'>('forgot');
  const [loading, setLoading]= useState(false);
  const router = useRouter();

  const handleForgetPassSubmit = async(values: {email: string;})=>{
    try{
      setLoading(true);
      const response =await AuthService.forgotPassword(values.email);
      toast.success(response.data.message || "Password reset OTP sent to your email");
      sessionStorage.setItem('pendingAuth', JSON.stringify({ email: values.email }));
      setStep('reset');
    } 
    catch(error){
       const axiosError = error as AxiosError<{ message?: string }>;
       const errorMessage = axiosError.response?.data?.message || axiosError.message || "Forget Password Error";
       toast.error(errorMessage);
    } 
    finally {
      setLoading(false);
    }
  }

  const handleResetPassSubmit = async (values: { otp: string; newPassword: string; confirmPassword: string }) => {
    try {
      setLoading(true);

      const pending = sessionStorage.getItem('pendingAuth');
      const { email } = pending ? JSON.parse(pending) : { email: '' };

      await AuthService.resetPassword(email, values.otp, values.newPassword);
      toast.success("Password reset successfully");

      // Auto sign-in with new password then clear stored credentials
      sessionStorage.removeItem('pendingAuth');
      await signIn("credentials", { email, password: values.newPassword, redirect: false });

      router.push("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || axiosError.message || "Reset Password Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      pageLabel={step === 'forgot' ? 'Forgot Password' : 'Reset Password'}
      subtitle={step === 'forgot' ? "We'll send an OTP to your email" : 'Enter OTP and your new password'}
    >
      {step === 'forgot' ? (
        <Formik
          initialValues={{ email: '' }}
          validate={(values) => {
            const errors: Record<string, string> = {};
            if (!values.email) errors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Invalid email';
            return errors;
          }}
          onSubmit={handleForgetPassSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.email && errors.email ? 'error' : ''}
                />
                {touched.email && errors.email && (
                  <small className="text-danger">{errors.email}</small>
                )}
              </div>

              <button type="submit" className="nh-btn nh-btn--secondary nh-btn--full mb-3">
                Send OTP
              </button>

              <p className="text-center fs-sm text-muted-color">
                Remember your password?{' '}
                <Link href="/login">Sign in</Link>
              </p>
            </Form>
          )}
        </Formik>
      ) : (
        <Formik
          initialValues={{ otp: '', newPassword: '', confirmPassword: '' }}
          validate={(values) => {
            const errors: Record<string, string> = {};
            if (!values.otp) errors.otp = 'OTP is required';
            else if (values.otp.length !== 6) errors.otp = 'OTP must be 6 digits';
            if (!values.newPassword) errors.newPassword = 'New password is required';
            else if (values.newPassword.length < 8) errors.newPassword = 'Minimum 8 characters';
            if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password';
            else if (values.confirmPassword !== values.newPassword) errors.confirmPassword = 'Passwords do not match';
            return errors;
          }}
          onSubmit={handleResetPassSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="otp">OTP Code</label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={values.otp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.otp && errors.otp ? 'error' : ''}
                />
                {touched.otp && errors.otp ? (
                  <small className="text-danger">{errors.otp}</small>
                ) : (
                  <small className="text-muted-color fs-sm mt-1 d-block">Check your email for the OTP.</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <Input.Password
                  id="newPassword"
                  placeholder="Enter new password"
                  value={values.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.newPassword && errors.newPassword ? 'error' : ''}
                />
                {touched.newPassword && errors.newPassword && (
                  <small className="text-danger">{errors.newPassword}</small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <Input.Password
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  status={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <small className="text-danger">{errors.confirmPassword}</small>
                )}
              </div>

              <button type="submit" className="nh-btn nh-btn--secondary nh-btn--full mb-3">
                Reset Password
              </button>

              <p className="text-center fs-sm text-muted-color">
                <button type="button" className="btn-link" onClick={() => setStep('forgot')}>
                  ← Back
                </button>
              </p>
            </Form>
          )}
        </Formik>
      )}
    </AuthLayout>
  );
}
