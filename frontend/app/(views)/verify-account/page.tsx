'use client';

import Link from 'next/link';
import { Formik, Form } from 'formik';
import { Input } from 'antd';
import AuthLayout from '../../components/layout/AuthLayout';

export default function VerifyAccountPage() {
  return (
    <AuthLayout pageLabel="Verify Account" subtitle="Verify your email address">
      <Formik
        initialValues={{ email: '', otp: '' }}
        validate={(values) => {
          const errors: Record<string, string> = {};
          if (!values.email) errors.email = 'Email is required';
          else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Invalid email';
          if (!values.otp) errors.otp = 'OTP is required';
          else if (values.otp.length !== 6) errors.otp = 'OTP must be 6 digits';
          return errors;
        }}
        onSubmit={(values) => {
          console.log('Verify:', values);
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
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
