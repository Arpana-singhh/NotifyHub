'use client';

import Link from 'next/link';
import { Formik, Form } from 'formik';
import { Input } from 'antd';
import AuthLayout from '../../components/layout/AuthLayout';
import AuthService from '@/app/service/api/auth.services';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function VerifyAccountPage() {
  const router = useRouter();
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingAuth');
    if (pending) {
      const { email } = JSON.parse(pending);
      setPendingEmail(email);
    }
  }, []);
  const handleSubmit = async (values: { email: string; otp: string }) => {
    try{
       const response = await AuthService.verifyEmail(values.email, values.otp);
       toast.success(response.data.message || "Email verified successfully");

       // Auto sign-in using credentials stored during registration
       const pending = sessionStorage.getItem('pendingAuth');
       if (pending) {
         const { email, password } = JSON.parse(pending);
         sessionStorage.removeItem('pendingAuth');
         await signIn("credentials", { email, password, redirect: false });
       }

       router.push("/dashboard");
    }catch(error){
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage = axiosError.response?.data?.message || axiosError.message || "Verification failed";
        toast.error(errorMessage);
    }
  }
  return (
    <AuthLayout pageLabel="Verify Account" subtitle="Verify your email address">
      <Formik
        initialValues={{ email: pendingEmail, otp: '' }}
        enableReinitialize
        validate={(values) => {
          const errors: Record<string, string> = {};
          if (!values.otp) errors.otp = 'OTP is required';
          else if (values.otp.length !== 6) errors.otp = 'OTP must be 6 digits';
          return errors;
        }}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <Input
                id="email"
                type="email"
                value={values.email}
                readOnly
                disabled
              />
              {touched.email && errors.email && (
                <small className="text-danger">{errors.email}</small>
              )}
            </div>

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

            <button type="submit" className="nh-btn nh-btn--secondary nh-btn--full mb-3">
              Verify Account
            </button>

            <p className="text-center fs-sm text-muted-color">
              Didn&apos;t receive OTP?{' '}
              <Link href="/register">Resend OTP</Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
