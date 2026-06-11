import Reveal from './Reveal';

const FEATURES = [
  {
    icon: 'fa-bolt',
    title: 'Real-time delivery',
    description: 'Notifications reach your users the moment you hit send — no queues, no delays.',
  },
  {
    icon: 'fa-user-shield',
    title: 'Role-based targeting',
    description: 'Send to everyone, admins only, or hand-picked users with precise audience control.',
  },
  {
    icon: 'fa-check-double',
    title: 'Read tracking',
    description: 'Know exactly who has seen each notification with per-user read receipts.',
  },
  {
    icon: 'fa-layer-group',
    title: 'Bulk management',
    description: 'Select, review and clean up notifications in bulk from one powerful admin table.',
  },
  {
    icon: 'fa-list-check',
    title: 'Delivery logs',
    description: 'A full audit trail of every delivery — filterable by user, type and read status.',
  },
  {
    icon: 'fa-lock',
    title: 'Secure access',
    description: 'Verified accounts, protected sessions and admin-level controls keep your data safe.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="home-section">
      <div className="container">
        <Reveal className="home-section__head">
          <span className="home-section__eyebrow">Features</span>
          <h2 className="home-section__title">Everything you need to keep users informed</h2>
          <p className="home-section__sub">
            One platform for sending, targeting and tracking notifications — built for admins, loved by users.
          </p>
        </Reveal>

        <div className="row g-4">
          {FEATURES.map((feature, i) => (
            <div key={feature.title} className="col-12 col-md-6 col-lg-4">
              <Reveal delay={i * 80} className="h-100">
                <div className="feature-card">
                  <span className="feature-card__icon" data-section="dark">
                    <i className={`fas ${feature.icon}`} />
                  </span>
                  <h3 className="feature-card__title">{feature.title}</h3>
                  <p className="feature-card__description">{feature.description}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
