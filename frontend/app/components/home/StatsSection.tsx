import Reveal from './Reveal';
import CountUp from './CountUp';

const STATS = [
  { end: 99.9, decimals: 1, suffix: '%', label: 'Uptime', sub: 'Always-on delivery' },
  { end: 50000, suffix: '+', label: 'Notifications sent', sub: 'And counting' },
  { end: 1200, suffix: '+', label: 'Active users', sub: 'Across all teams' },
  { end: 50, prefix: '<', suffix: 'ms', label: 'Avg. latency', sub: 'From send to inbox' },
];

export default function StatsSection() {
  return (
    <section id="stats" className="home-stats" data-section="dark">
      <div className="container">
        <div className="row g-4">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="col-6 col-lg-3">
              <Reveal delay={i * 100}>
                <div className="home-stats__item">
                  <div className="home-stats__value">
                    <CountUp
                      end={stat.end}
                      decimals={stat.decimals}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="home-stats__label">{stat.label}</div>
                  <div className="home-stats__sub">{stat.sub}</div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
