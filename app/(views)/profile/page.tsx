import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';

export default function ProfilePage() {
  return (
    <DashboardLayout userInitials="JS" unreadCount={5}>
      <div className="main-content__header">
        <h1 className="main-content__title">My Profile</h1>
      </div>

      <div className="container-fluid px-0">
        <div className="row g-4">
          {/* Profile Info */}
          <div className="col-12 col-md-6">
            <div className="nh-card">
              <div className="nh-card__header">
                <span className="nh-card__title">Profile Info</span>
              </div>
              <div className="nh-card__body">
                <div className="profile-avatar-section">
                  <Avatar initials="JS" size="xl" />
                  <button className="nh-btn nh-btn--outline nh-btn--sm">
                    <i className="fas fa-arrow-up-from-bracket" />
                    Change avatar
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor="fullname">Full name</label>
                  <input
                    id="fullname"
                    type="text"
                    className="nh-input"
                    defaultValue="Jane Smith"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="nh-input"
                    defaultValue="jane@example.com"
                    readOnly
                  />
                </div>

                <button className="nh-btn nh-btn--secondary nh-btn--full mt-2">
                  Save changes
                </button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="col-12 col-md-6">
            <div className="nh-card">
              <div className="nh-card__header">
                <span className="nh-card__title">Change password</span>
              </div>
              <div className="nh-card__body">
                <div className="form-group">
                  <label htmlFor="current-pw">Current password</label>
                  <input
                    id="current-pw"
                    type="password"
                    className="nh-input"
                    defaultValue="password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-pw">New password</label>
                  <input
                    id="new-pw"
                    type="password"
                    className="nh-input"
                    defaultValue="password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-pw">Confirm new password</label>
                  <input
                    id="confirm-pw"
                    type="password"
                    className="nh-input"
                    defaultValue="password"
                  />
                </div>

                <button className="nh-btn nh-btn--danger nh-btn--full mt-2">
                  Update password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
