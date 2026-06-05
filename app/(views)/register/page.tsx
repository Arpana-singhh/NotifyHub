import Link from 'next/link';
import AuthLayout from '../../components/layout/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout pageLabel="Register" subtitle="Create your account">
      <div className="form-group">
        <label htmlFor="fullname">Full name</label>
        <input
          id="fullname"
          type="text"
          className="nh-input"
          defaultValue="Jane Smith"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          className="nh-input"
          defaultValue="jane@example.com"
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

      <div className="form-group">
        <label htmlFor="confirm">Confirm password</label>
        <input
          id="confirm"
          type="password"
          className="nh-input"
          defaultValue="password"
        />
      </div>

      <Link href="/dashboard" className="nh-btn nh-btn--secondary nh-btn--full mb-3">
        Create account
      </Link>

      <p className="text-center fs-sm text-muted-color">
        Already have an account?{' '}
        <Link href="/">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
