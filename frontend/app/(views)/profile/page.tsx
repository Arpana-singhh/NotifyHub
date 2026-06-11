'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios'; // still used by handleChangePassword
import DashboardLayout from '../../components/layout/DashboardLayout';
import AvatarUpload from '../../components/common/AvatarUpload';

import AuthService from '@/app/service/api/auth.services';
import { useUserStore } from '@/app/store/userStore';

export default function ProfilePage() {
  const { user, isSaving, fetchUser, updateUser } = useUserStore();

  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatarPreview(undefined);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    await updateUser(name, avatarPreview);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setChangingPassword(true);
      await AuthService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <DashboardLayout userInitials={user?.name ? user.name.charAt(0).toUpperCase() : '?'} unreadCount={5}>
      <div className="main-content__header">
        <h1 className="main-content__title">My Profile</h1>
      </div>

      <div className="container-fluid px-0">
        <div className="row g-4 align-items-stretch">
          {/* Profile Info */}
          <div className="col-12 col-md-6">
            <div className="nh-card cmn-card">
              <div className="nh-card__header">
                <span className="nh-card__title">Profile Info</span>
              </div>
              <div className="nh-card__body">
                <div className="profile-avatar-section">
                  <AvatarUpload
                    initials={user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                    src={avatarPreview ?? user?.avatar}
                    size="xl"
                    uploading={isSaving}
                    onUpload={setAvatarPreview}
                  />
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Click or drag an image to change avatar
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="fullname">Full name</label>
                  <input
                    id="fullname"
                    type="text"
                    className="nh-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="nh-input"
                    value={user?.email ?? ''}
                    readOnly
                  />
                </div>

                <button
                  className="nh-btn nh-btn--primary nh-btn--full mt-2"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="col-12 col-md-6">
            <div className="nh-card cmn-card h-100 change-password">
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
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-pw">New password</label>
                  <input
                    id="new-pw"
                    type="password"
                    className="nh-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-pw">Confirm new password</label>
                  <input
                    id="confirm-pw"
                    type="password"
                    className="nh-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  className="nh-btn nh-btn--danger nh-btn--full"
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
