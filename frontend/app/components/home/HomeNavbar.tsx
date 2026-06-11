import Link from 'next/link';

export default function HomeNavbar() {
  return (
    <header className="home-nav">
      <Link href="/" className="home-nav__brand">
        <i className="fas fa-bell" />
        NotifyHub
      </Link>

      <nav className="home-nav__links">
        <a href="#features">Features</a>
        <a href="#stats">Highlights</a>
        <a href="#how-it-works">How it works</a>
      </nav>

      <div className="home-nav__actions">
        <Link href="/login" className="nh-btn nh-btn--outline">
          Log in
        </Link>
        <Link href="/register" className="nh-btn nh-btn--primary" data-section="dark">
          Get started
        </Link>
      </div>
    </header>
  );
}
