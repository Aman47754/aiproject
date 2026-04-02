import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Login.css';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const [formData, setFormData] = useState({
    restaurant_name: '',
    restaurant_description: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        restaurant_name: user.restaurant_name || '',
        restaurant_description: user.restaurant_description || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="login-container" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="login-card" style={{ maxWidth: '500px' }}>
          <h1 className="login-title">Restaurant Profile</h1>
          <p className="login-subtitle">Management details for {user?.email}</p>
          
          {message && <div className={`login-error ${message.includes('successfully') ? 'success' : ''}`} style={{ backgroundColor: message.includes('successfully') ? 'rgba(16, 185, 129, 0.1)' : '', color: message.includes('successfully') ? '#10b981' : '', borderColor: message.includes('successfully') ? 'rgba(16, 185, 129, 0.2)' : '' }}>{message}</div>}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Restaurant Name</label>
              <input 
                type="text" 
                value={formData.restaurant_name} 
                onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Restaurant Description</label>
              <textarea 
                value={formData.restaurant_description} 
                onChange={(e) => setFormData({ ...formData, restaurant_description: e.target.value })} 
                rows="4"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
          
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={logout} className="btn-secondary" style={{ width: '100%' }}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
