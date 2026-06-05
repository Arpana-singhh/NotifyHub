import Link from 'next/link';
import AuthLayout from './components/layout/AuthLayout';

export default function LoginPage() {
  return (
    <AuthLayout pageLabel="Login" subtitle="Sign in to your account">
      <div className="form-group">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          className="nh-input"
          defaultValue="admin@notifyhub.io"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="nh-input"
          defaultValue="password"
        />
      </div>

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="form-check">
          <input type="checkbox" id="remember" defaultChecked />
          <label htmlFor="remember">Remember me</label>
        </div>
        <Link href="#" className="fs-sm">Forgot password?</Link>
      </div>

      <Link href="/dashboard" className="nh-btn nh-btn--secondary nh-btn--full mb-3">
        Sign in
      </Link>

      <p className="text-center fs-sm text-muted-color">
        Don&apos;t have an account?{' '}
        <Link href="/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
