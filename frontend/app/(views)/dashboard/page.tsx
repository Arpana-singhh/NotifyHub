import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import NotificationItem from '../../components/common/NotificationItem';

const RECENT_NOTIFICATIONS = [
  {
    type: 'info' as const,
    title: 'System update scheduled',
    subtitle: 'Maintenance window on Sunday 2–4 AM UTC',
    time: '2 min ago',
  },
  {
    type: 'success' as const,
    title: 'Your report is ready',
    subtitle: 'The Q3 analytics report has been generated',
    time: '15 min ago',
  },
  {
    type: 'warning' as const,
    title: 'Storage usage high',
    subtitle: 'You\'re using 87% of your storage quota',
    time: '1 hr ago',
  },
  {
    type: 'error' as const,
    title: 'Login from new device',
    subtitle: 'Unrecognized login from Chrome on Windows',
    time: '3 hrs ago',
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout userInitials="JS" unreadCount={5}>
      <div className="main-content__header">
        <h1 className="main-content__title">My Dashboard</h1>
        <div className="live-status">
          <span className="live-status__dot" />
          Live updates active
        </div>
      </div>

      {/* Stats row — Bootstrap grid */}
      <div className="container-fluid px-0 mb-4">
        <div className="row g-3">
          <div className="col-12 col-sm-4">
            <StatCard label="Total" value={24} sub="All notifications" />
          </div>
          <div className="col-12 col-sm-4">
            <StatCard label="Unread" value={5} sub="Need attention" valueVariant="primary" />
          </div>
          <div className="col-12 col-sm-4">
            <StatCard label="Read" value={19} sub="All caught up" valueVariant="success" />
          </div>
        </div>
      </div>

      {/* Recent notifications */}
      <div className="nh-card">
        <div className="nh-card__header">
          <span className="nh-card__title">Recent notifications</span>
        </div>
        {RECENT_NOTIFICATIONS.map((n, i) => (
          <NotificationItem key={i} showTime {...n} />
        ))}
      </div>
    </DashboardLayout>
  );
}
