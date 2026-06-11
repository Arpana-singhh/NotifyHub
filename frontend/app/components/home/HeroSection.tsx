import Link from 'next/link';
import Badge from '../common/Badge';

const MOCK_NOTIFICATIONS = [
  {
    icon: 'fa-circle-info',
    variant: 'info' as const,
    type: 'Info',
    title: 'New release deployed',
    message: 'Version 2.4 is now live for all users.',
    time: 'Just now',
  },
  {
    icon: 'fa-circle-check',
    variant: 'success' as const,
    type: 'Success',
    title: 'Payment received',
    message: 'Invoice #1042 was paid successfully.',
    time: '2 min ago',
  },
  {
    icon: 'fa-triangle-exclamation',
    variant: 'warning' as const,
    type: 'Warning',
    title: 'Storage almost full',
    message: 'You have used 90% of your storage quota.',
    time: '10 min ago',
  },
];

export default function HeroSection() {
  return (
    <section className="home-hero">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6">
            <div className="home-hero__content">
              <span className="home-hero__badge">
                <span className="home-hero__badge-dot" />
                Real-time notification platform
              </span>

              <h1 className="home-hero__title">
                Deliver the right message, <span>to the right people</span>, instantly.
              </h1>

              <p className="home-hero__sub">
                NotifyHub lets your team send, target and track notifications across your
                entire user base — with role-based delivery, read tracking and a clean
                admin dashboard built for speed.
              </p>

              <div className="home-hero__actions" >
                <Link href="/register" className="nh-btn nh-btn--primary" data-section="dark">
                  Get started free
                  <i className="fas fa-arrow-right" />
                </Link>
                <a href="#how-it-works" className="nh-btn nh-btn--secondary">
                  See how it works
                </a>
              </div>

              <div className="home-hero__trust">
                <i className="fas fa-shield-halved" />
                Secure, role-based access out of the box
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="home-hero__visual">
              <div className="notif-mock">
                <div className="notif-mock__header">
                  <span className="notif-mock__title">
                    <i className="fas fa-bell" />
                    Notifications
                  </span>
                  <span className="notif-mock__live">
                    <span className="notif-mock__live-dot" />
                    Live
                  </span>
                </div>

                <div className="notif-mock__body">
                  {MOCK_NOTIFICATIONS.map((n, i) => (
                    <div
                      key={n.title}
                      className="notif-mock__item"
                      style={{ animationDelay: `${0.3 + i * 0.25}s` }}
                    >
                      <span className={`notif-mock__icon notif-mock__icon--${n.variant}`}>
                        <i className={`fas ${n.icon}`} />
                      </span>
                      <span className="notif-mock__text">
                        <span className="notif-mock__item-title">{n.title}</span>
                        <span className="notif-mock__item-message">{n.message}</span>
                      </span>
                      <span className="notif-mock__meta">
                        <Badge variant={n.variant}>{n.type}</Badge>
                        <span className="notif-mock__time">{n.time}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="notif-mock__float notif-mock__float--bell">
                <i className="fas fa-bell" />
                <span className="notif-mock__ping" />
              </div>
              <div className="notif-mock__float notif-mock__float--check">
                <i className="fas fa-check-double" />
                Read by 1,248 users
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
