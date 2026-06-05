import Badge from './Badge';

type NotifType = 'info' | 'success' | 'warning' | 'error';
type NotifStatus = 'read' | 'unread';

interface NotificationItemProps {
  type: NotifType;
  title: string;
  subtitle: string;
  time?: string;
  status?: NotifStatus;
  showTime?: boolean;
  showStatus?: boolean;
  showDelete?: boolean;
}

export default function NotificationItem({
  type,
  title,
  subtitle,
  time,
  status,
  showTime = false,
  showStatus = false,
  showDelete = false,
}: NotificationItemProps) {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="notif-item">
      <span className={`notif-item__dot notif-item__dot--${type}`} />
      <div className="notif-item__body">
        <div className="notif-item__title">{title}</div>
        <div className="notif-item__sub">{subtitle}</div>
        {showTime && time && <div className="notif-item__time">{time}</div>}
      </div>
      <div className="notif-item__meta">
        <Badge variant={type}>{typeLabel}</Badge>
        {showStatus && status && (
          <Badge variant={status === 'unread' ? 'primary' : 'neutral'}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )}
        {showDelete && (
          <button className="nh-btn nh-btn--icon" aria-label="Delete">
            <i className="fas fa-trash-can" />
          </button>
        )}
      </div>
    </div>
  );
}
