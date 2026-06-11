import Reveal from './Reveal';

const STEPS = [
  {
    icon: 'fa-user-plus',
    title: 'Create your account',
    description: 'Sign up in seconds and verify your email. Admins get instant access to the full dashboard.',
  },
  {
    icon: 'fa-paper-plane',
    title: 'Compose & target',
    description: 'Write your notification, pick a type, and choose exactly who receives it — all users or a custom list.',
  },
  {
    icon: 'fa-chart-line',
    title: 'Track delivery',
    description: 'Watch read receipts roll in, audit the delivery log, and manage everything from one place.',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="home-section home-section--alt">
      <div className="container">
        <Reveal className="home-section__head">
          <span className="home-section__eyebrow">How it works</span>
          <h2 className="home-section__title">Up and running in three steps</h2>
          <p className="home-section__sub">
            No complex setup. No integrations required. Just sign up and start notifying.
          </p>
        </Reveal>

        <div className="row g-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="col-12 col-md-4">
              <Reveal delay={i * 120} className="h-100">
                <div className="step-card">
                  <span className="step-card__number"  data-section="dark">{i + 1}</span>
                  <span className="step-card__icon">
                    <i className={`fas ${step.icon}`} />
                  </span>
                  <h3 className="step-card__title">{step.title}</h3>
                  <p className="step-card__description">{step.description}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
