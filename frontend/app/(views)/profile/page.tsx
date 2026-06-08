'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Avatar from '../../components/common/Avatar';

import AuthService from '@/app/service/api/auth.services';
import UserService from '@/app/service/api/user.services';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    UserService.getUser()
      .then((res: { data: { user?: { name: string; email: string } } }) => {
        setName(res.data.user?.name ?? '');
        setEmail(res.data.user?.email ?? '');
      })
      .catch(() => toast.error('Failed to load profile'));
  }, []);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await UserService.updateUser({ name });
      toast.success('Profile updated successfully');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
    <DashboardLayout userInitials={name ? name.charAt(0).toUpperCase() : '?'} unreadCount={5}>
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
                  <Avatar initials={name ? name.charAt(0).toUpperCase() : '?'} size="xl" />
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
                    value={email}
                    readOnly
                  />
                </div>

                <button
                  className="nh-btn nh-btn--secondary nh-btn--full mt-2"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save changes'}
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
                  className="nh-btn nh-btn--danger nh-btn--full mt-2"
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
