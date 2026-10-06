import { useState } from 'react';
import { X, Mail, User as UserIcon, Hash, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AuthModal.css';

const AuthModal = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    inGameName: '',
    gameUid: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        // Supabase Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) throw error;

        const user = data.user;
        const metadata = user.user_metadata || {};
        const profile = {
          id: user.id,
          email: user.email,
          inGameName: metadata.inGameName || metadata.full_name || user.email.split('@')[0],
          uid: metadata.gameUid || 'XO-' + user.id.slice(0, 8),
        };

        if (onLogin) onLogin(profile);
      } else {
        // Supabase Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            data: {
              inGameName: formData.inGameName.trim() || 'Survivor',
              gameUid: formData.gameUid.trim() || '12345678',
            },
          },
        });

        if (error) throw error;

        // Check if session was returned immediately (email confirmation disabled)
        if (data.session && data.user) {
          const user = data.user;
          const metadata = user.user_metadata || {};
          const profile = {
            id: user.id,
            email: user.email,
            inGameName: metadata.inGameName || formData.inGameName || user.email.split('@')[0],
            uid: metadata.gameUid || formData.gameUid || 'XO-' + user.id.slice(0, 8),
          };
          if (onLogin) onLogin(profile);
        } else {
          // If Supabase has email confirmation turned on
          setSuccessMsg('Account created! Please check your email inbox to confirm your account, then log in.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      console.error('Supabase Auth Error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content glass-panel">
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
        
        <h2 className="modal-title text-gradient">
          {isLogin ? 'WELCOME BACK' : 'JOIN HAARSH XO'}
        </h2>
        
        <div className="auth-toggle">
          <button 
            className={`toggle-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
            type="button"
          >
            Login
          </button>
          <button 
            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
            type="button"
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="auth-error-box">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-success-box">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: (errorMsg || successMsg) ? '1rem' : '0' }}>
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              name="email"
              placeholder="Email address" 
              value={formData.email}
              onChange={handleChange}
              required 
              autoComplete="email"
            />
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <UserIcon className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="inGameName"
                  placeholder="Free Fire Nickname (e.g. Raistar)" 
                  value={formData.inGameName}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="input-group">
                <Hash className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="gameUid"
                  placeholder="Free Fire Game UID (e.g. 849204812)" 
                  value={formData.gameUid}
                  onChange={handleChange}
                  required 
                />
              </div>
            </>
          )}

          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input 
              type="password" 
              name="password"
              placeholder="Password (min 6 characters)" 
              value={formData.password}
              onChange={handleChange}
              required 
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={18} className="animate-spin" />
                {isLogin ? 'LOGGING IN...' : 'CREATING ACCOUNT...'}
              </span>
            ) : (
              isLogin ? 'LOGIN WITH SUPABASE' : 'CREATE ACCOUNT'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
