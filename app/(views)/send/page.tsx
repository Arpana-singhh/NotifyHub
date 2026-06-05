import DashboardLayout from '../../components/layout/DashboardLayout';

export default function SendNotificationPage() {
  return (
    <DashboardLayout isAdmin userName="Admin User" userInitials="AU">
      <div className="main-content__header">
        <h1 className="main-content__title">Create Notification</h1>
      </div>

      <div className="container-fluid px-0">
        <div className="row justify-content-start">
          <div className="col-12 col-xl-8">
            <div className="nh-card">
              <div className="nh-card__body">
                {/* Title */}
                <div className="form-group">
                  <label htmlFor="notif-title">Title</label>
                  <input
                    id="notif-title"
                    type="text"
                    className="nh-input"
                    defaultValue="System maintenance scheduled for Sunday"
                  />
                </div>

                {/* Message */}
                <div className="form-group">
                  <label htmlFor="notif-message">Message</label>
                  <textarea
                    id="notif-message"
                    className="nh-input"
                    rows={4}
                    defaultValue="We will be performing scheduled maintenance on Sunday June 8 from 2:00 AM to 4:00 AM UTC. Some features may be temporarily unavailable during this time."
                  />
                </div>

                {/* Type & Recipients row */}
                <div className="container-fluid px-0">
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <div className="form-group mb-0">
                        <label>Notification type</label>
                        <div className="type-selector">
                          <button className="type-selector__option type-selector__option--info-active">
                            <i className="fas fa-circle-info" />
                            Info
                          </button>
                          <button className="type-selector__option">
                            <i className="fas fa-circle-check" />
                            Success
                          </button>
                          <button className="type-selector__option">
                            <i className="fas fa-triangle-exclamation" />
                            Warning
                          </button>
                          <button className="type-selector__option">
                            <i className="fas fa-circle-xmark" />
                            Error
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <div className="form-group mb-0">
                        <label>Recipients</label>
                        <button className="recipient-option recipient-option--active">
                          <span>
                            <i className="fas fa-users me-2" />
                            All users
                          </span>
                          <span className="recipient-option__count">142</span>
                        </button>
                        <button className="recipient-option">
                          <span>
                            <i className="fas fa-user me-2" />
                            Select users
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex gap-3 mt-4">
                  <button className="nh-btn nh-btn--secondary flex-grow-1">
                    Send notification&nbsp;<i className="fas fa-paper-plane" />
                  </button>
                  <button className="nh-btn nh-btn--outline">Clear</button>
                </div>

                {/* SSE note */}
                <div className="sse-note">
                  <span className="sse-note__dot" />
                  Notifications are delivered instantly via SSE — no page refresh needed for recipients
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
