import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    restaurant_name: '',
    restaurant_description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        // Automatically login after registration
        const loginRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          login(loginData.token, loginData.user);
          navigate('/');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '500px' }}>
        <h1 className="login-title">Register Your Restaurant</h1>
        <p className="login-subtitle">Join thousands of restaurants using AI pricing</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="owner@restaurant.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="••••••••"
            />
          </div>
          <div className="form-group">
            <label>Restaurant Name</label>
            <input 
              type="text" 
              name="restaurant_name"
              value={formData.restaurant_name} 
              onChange={handleChange} 
              required 
              placeholder="Flavor Garden"
            />
          </div>
          <div className="form-group">
            <label>Restaurant Description</label>
            <textarea 
              name="restaurant_description"
              value={formData.restaurant_description} 
              onChange={handleChange} 
              placeholder="A cozy spot serving Italian and Indian fusion..."
              rows="3"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating account...' : 'Complete Registration'}
          </button>
        </form>
        <p className="login-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
