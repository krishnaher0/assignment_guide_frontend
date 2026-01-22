import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const {
    values: profileValues,
    handleChange: handleProfileChange,
    handleSubmit: handleProfileSubmit,
    isSubmitting: profileSubmitting,
  } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institution: user?.institution || '',
  });

  const {
    values: passwordValues,
    errors: passwordErrors,
    handleChange: handlePasswordChange,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    isSubmitting: passwordSubmitting,
  } = useForm(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    (values) => {
      const errors = {};
      if (!values.currentPassword) errors.currentPassword = 'Current password is required';
      if (!values.newPassword) errors.newPassword = 'New password is required';
      if (values.newPassword && values.newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters';
      }
      if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      return errors;
    }
  );

  const onProfileSubmit = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const onPasswordSubmit = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Password changed:', data);
    setPasswordSaved(true);
    resetPassword();
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          <p className="text-sm text-gray-500 mt-1">
            Update your personal details
          </p>
        </div>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <Button type="button" variant="outline" size="sm">
                Change Photo
              </Button>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG. Max 2MB</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="name"
              value={profileValues.name}
              onChange={handleProfileChange}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={profileValues.email}
              disabled
              helperText="Email cannot be changed"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={profileValues.phone}
              onChange={handleProfileChange}
            />
            <Input
              label="Institution / University"
              name="institution"
              placeholder="e.g., Stanford University"
              value={profileValues.institution}
              onChange={handleProfileChange}
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" loading={profileSubmitting}>
              Save Changes
            </Button>
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Changes saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-500 mt-1">
            Update your password to keep your account secure
          </p>
        </div>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="p-6 space-y-6">
          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            placeholder="Enter current password"
            value={passwordValues.currentPassword}
            onChange={handlePasswordChange}
            error={passwordErrors.currentPassword}
          />
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              value={passwordValues.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              helperText="Must be at least 8 characters"
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={passwordValues.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button type="submit" loading={passwordSubmitting}>
              Update Password
            </Button>
            {passwordSaved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Password updated!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage how you receive updates
          </p>
        </div>
        <div className="p-6 space-y-4">
          {[
            { id: 'email_updates', label: 'Email notifications', description: 'Receive updates about your orders via email' },
            { id: 'order_status', label: 'Order status updates', description: 'Get notified when your order status changes' },
            { id: 'promotions', label: 'Promotional emails', description: 'Receive special offers and discounts' },
          ].map((item) => (
            <label key={item.id} className="flex items-start gap-4 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={item.id !== 'promotions'}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm">
        <div className="p-6 border-b border-red-100">
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-gray-500 mt-1">
            Irreversible account actions
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
