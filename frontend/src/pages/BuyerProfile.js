import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './ModulePages.css';

const BuyerProfile = () => {
  const { user, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: 'Karur',
    state: 'Tamil Nadu',
    pincode: ''
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || 'Karur',
      state: user.address?.state || 'Tamil Nadu',
      pincode: user.address?.pincode || ''
    });
  }, [user]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode
        }
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please enter current and new password');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await api.put('/auth/updatepassword', passwordForm);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 3rem' }}>
      <div className="dashboard-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your contact details and password</p>
        </div>
      </div>

      <div className="module-settings-grid">
        <div className="card">
          <div className="card-header">
            <h3>Profile Details</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleProfileSave}>
              <div className="module-form-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-input"
                    value={profileForm.name}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, name: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={profileForm.phone}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, phone: event.target.value }))}
                  />
                </div>
                <div className="form-group module-full-row">
                  <label className="form-label">Street</label>
                  <input
                    className="form-input"
                    value={profileForm.street}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, street: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    className="form-input"
                    value={profileForm.city}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, city: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    className="form-input"
                    value={profileForm.state}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, state: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    className="form-input"
                    value={profileForm.pincode}
                    onChange={(event) => setProfileForm((previous) => ({ ...previous, pincode: event.target.value }))}
                  />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Change Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordSave}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((previous) => ({ ...previous, currentPassword: event.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((previous) => ({ ...previous, newPassword: event.target.value }))}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;
