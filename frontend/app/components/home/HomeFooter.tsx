import Link from 'next/link';

export default function HomeFooter() {
  return (
    <footer className="home-footer">
      <div className="container">
        <div className="home-footer__inner">
          <span className="home-footer__brand">
            <i className="fas fa-bell" />
            NotifyHub
          </span>

          <nav className="home-footer__links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <Link href="/login">Log in</Link>
            <Link href="/register">Sign up</Link>
          </nav>

          <span className="home-footer__copy">
            © {new Date().getFullYear()} NotifyHub. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
