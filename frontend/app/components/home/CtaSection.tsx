import Link from 'next/link';
import Reveal from './Reveal';

export default function CtaSection() {
  return (
    <section className="home-section">
      <div className="container">
        <Reveal>
          <div className="home-cta" data-section="dark">
            <div className="home-cta__glow" aria-hidden="true" />
            <h2 className="home-cta__title">Ready to keep everyone in the loop?</h2>
            <p className="home-cta__sub">
              Join the teams already using NotifyHub to deliver messages that actually get read.
            </p>
            <div className="home-cta__actions">
              <Link href="/register" className="nh-btn nh-btn--secondary" data-section="light">
                Create free account
                <i className="fas fa-arrow-right" />
              </Link>
              <Link href="/login" className="home-cta__link">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
