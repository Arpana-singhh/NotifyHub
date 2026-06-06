import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="auth-layout">
      <div className="auth-layout__bar">NotifyHub</div>
      <section className="auth-layout__main">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="auth-layout__card text-center">
                <div className="auth-layout__brand">
                  <div className="auth-layout__brand-title justify-content-center">
                    <i className="fas fa-bell" />
                    NotifyHub
                  </div>
                  <div className="auth-layout__brand-sub">Landing page coming soon</div>
                </div>

                <p className="text-muted-color mb-4">
                  We are preparing the public landing page. You can continue with authentication for now.
                </p>

                <Link href="/login" className="nh-btn nh-btn--secondary">
                  Go to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
