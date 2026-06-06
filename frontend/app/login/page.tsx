'use client';

import Link from 'next/link';
import { Formik, Form } from 'formik';
import { Input, Checkbox } from 'antd';
import AuthLayout from '../components/layout/AuthLayout';
import AuthService from '../service/api/auth.services';
import { toast } from 'react-toastify';
import {useRouter} from 'next/navigation';
import { AxiosError } from 'axios';
import AxiosService from '../service/axios.services';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = async (values: { email: string; password: string; rememberMe: boolean }) => {
   try{
    const response = await AuthService.login(values.email, values.password);

    if (response.data.token) {
      AxiosService.setToken(response.data.token, values.rememberMe);
    }

    toast.success("Login successful");
    router.push("/dashboard");
   }catch(error){
     const axiosError = error as AxiosError<{ message?: string }>;
     const errorMessage = axiosError.response?.data?.message || axiosError.message || "Verification failed";
     toast.error(errorMessage)
   }
  }
  return (
    <AuthLayout pageLabel="Login" subtitle="Sign in to your account">
      <Formik
        initialValues={{ email: '', password: '', rememberMe: false }}
        validate={(values) => {
          const errors: Record<string, string> = {};
          if (!values.email) errors.email = 'Email is required';
          else if (!/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Invalid email';
          if (!values.password) errors.password = 'Password is required';
          return errors;
        }}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
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

            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="form-checkbox">
                <Checkbox
                  checked={values.rememberMe}
                  onChange={(event) => setFieldValue('rememberMe', event.target.checked)}
                /> <label>Remember me</label>
              </div>
              <Link href="/forgot-password" className="fs-sm">Forgot password?</Link>
            </div>

            <button type="submit" className="nh-btn nh-btn--secondary nh-btn--full mb-3">
              Sign in
            </button>

            <p className="text-center fs-sm text-muted-color">
              Don&apos;t have an account?{' '}
              <Link href="/register">Register</Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
