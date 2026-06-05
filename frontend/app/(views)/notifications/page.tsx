import DashboardLayout from '../../components/layout/DashboardLayout';
import NotificationItem from '../../components/common/NotificationItem';
import Pagination from '../../components/common/Pagination';

const NOTIFICATIONS = [
  {
    type: 'info' as const,
    title: 'System update scheduled',
    subtitle: 'Maintenance window on Sunday 2–4 AM UTC',
    status: 'unread' as const,
  },
  {
    type: 'success' as const,
    title: 'Your report is ready',
    subtitle: 'The Q3 analytics report has been generated',
    status: 'read' as const,
  },
  {
    type: 'warning' as const,
    title: 'Storage usage high',
    subtitle: 'You\'re using 87% of your storage quota',
    status: 'read' as const,
  },
  {
    type: 'error' as const,
    title: 'Login from new device',
    subtitle: 'Unrecognized login from Chrome on Windows',
    status: 'unread' as const,
  },
];

const TYPE_CHIPS = ['All', 'Unread', 'Read', 'Info', 'Success', 'Warning', 'Error'];

export default function NotificationsPage() {
  return (
    <DashboardLayout userInitials="JS" unreadCount={5}>
      <div className="main-content__header">
        <h1 className="main-content__title">My Notifications</h1>
      </div>

      {/* Toolbar */}
      <div className="toolbar mb-3">
        <div className="search-wrap flex-grow-1" style={{ maxWidth: 320 }}>
          <i className="fas fa-search search-icon" />
          <input
            type="text"
            className="nh-input nh-input--search"
            placeholder="Search notifications..."
          />
        </div>
        <select className="nh-select">
          <option>Type</option>
          <option>Info</option>
          <option>Success</option>
          <option>Warning</option>
          <option>Error</option>
        </select>
        <select className="nh-select">
          <option>Status</option>
          <option>Read</option>
          <option>Unread</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="filter-chips mb-4">
        {TYPE_CHIPS.map((chip, i) => (
          <button
            key={chip}
            className={`filter-chips__chip${i === 0 ? ' filter-chips__chip--active' : ''}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="nh-card">
        {NOTIFICATIONS.map((n, i) => (
          <NotificationItem
            key={i}
            showStatus
            showDelete
            {...n}
          />
        ))}
        <Pagination current={1} total={3} />
      </div>
    </DashboardLayout>
  );
}
