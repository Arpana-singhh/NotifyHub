import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';

const BAR_DAYS = [
  { label: 'Mon', height: 35, active: false },
  { label: 'Tue', height: 28, active: false },
  { label: 'Wed', height: 45, active: false },
  { label: 'Thu', height: 38, active: false },
  { label: 'Fri', height: 52, active: false },
  { label: 'Sat', height: 65, active: false },
  { label: 'Sun', height: 100, active: true },
];

const READ_RATES = [
  { label: 'Info',    pct: 82, variant: 'info' },
  { label: 'Success', pct: 91, variant: 'success' },
  { label: 'Warning', pct: 74, variant: 'warning' },
  { label: 'Error',   pct: 95, variant: 'error' },
];

export default function AdminDashboardPage() {
  return (
    <DashboardLayout isAdmin userName="Admin User" userInitials="AU">
      <div className="main-content__header">
        <h1 className="main-content__title">Admin Dashboard</h1>
      </div>

      {/* Stats row */}
      <div className="container-fluid px-0 mb-4">
        <div className="row g-3">
          <div className="col-6 col-lg-3">
            <StatCard label="Total Users" value="142" sub="+12 this week" />
          </div>
          <div className="col-6 col-lg-3">
            <StatCard label="Notifications" value="1,284" sub="Sent all time" />
          </div>
          <div className="col-6 col-lg-3">
            <StatCard label="Read" value="987" sub="76.9% read rate" valueVariant="success" />
          </div>
          <div className="col-6 col-lg-3">
            <StatCard label="Unread" value="297" sub="Pending" valueVariant="primary" />
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="container-fluid px-0">
        <div className="row g-3">
          {/* Bar chart */}
          <div className="col-12 col-lg-6">
            <div className="nh-card">
              <div className="nh-card__header">
                <span className="nh-card__title">Notifications sent — last 7 days</span>
              </div>
              <div className="nh-card__body">
                <div className="bar-chart">
                  {BAR_DAYS.map((d) => (
                    <div key={d.label} className="bar-chart__col">
                      <div
                        className={`bar-chart__bar${d.active ? ' bar-chart__bar--active' : ''}`}
                        style={{ height: `${d.height}%` }}
                      />
                      <span className="bar-chart__label">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bars */}
          <div className="col-12 col-lg-6">
            <div className="nh-card">
              <div className="nh-card__header">
                <span className="nh-card__title">Read rate by type</span>
              </div>
              <div className="nh-card__body">
                {READ_RATES.map((r) => (
                  <div key={r.label} className="progress-stat">
                    <div className="progress-stat__header">
                      <span className="progress-stat__label">{r.label}</span>
                      <span className="progress-stat__pct">{r.pct}%</span>
                    </div>
                    <div className="progress-stat__track">
                      <div
                        className={`progress-stat__fill progress-stat__fill--${r.variant}`}
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
