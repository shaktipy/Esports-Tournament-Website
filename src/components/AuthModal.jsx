import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, User as UserIcon, Hash, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './AuthModal.css';

const AuthModal = ({ onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [consent, setConsent] = useState(false);

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

    if (!isLogin && !consent) {
      setErrorMsg('Please accept the Terms & Conditions, Privacy Policy and confirm you are 13+ to register.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Supabase Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        const user = data.user;

        // Verify with backend if user has been banned or suspended by admin
        let isBanned = false;
        let banReason = '';
        try {
          const statusRes = await fetch(`/api/users/${encodeURIComponent(user.id)}/check-status`).catch(() =>
            fetch(`http://localhost:5001/api/users/${encodeURIComponent(user.id)}/check-status`)
          );
          if (statusRes && statusRes.ok) {
            const statusData = await statusRes.json();
            if (statusData.banned || statusData.status === 'banned' || statusData.status === 'suspended') {
              isBanned = true;
              banReason = statusData.statusReason || 'Violation of fair play or community rules.';
            }
          }
        } catch (e) {
          console.warn('[AuthModal] Status check error:', e);
        }

        // Additional safeguard: check local admin users cache if backend was unreachable
        if (!isBanned) {
          try {
            const meta = user.user_metadata || {};
            const userUid = meta.gameUid || 'XO-' + user.id.slice(0, 8);
            const userEmail = (user.email || '').toLowerCase();
            const localUsers = JSON.parse(localStorage.getItem('haarshxo_admin_users') || '[]');
            const localMatch = localUsers.find(u => 
              (u.id && u.id === user.id) ||
              (u.supabaseId && u.supabaseId === user.id) ||
              (u.email && u.email.toLowerCase() === userEmail) ||
              (u.uid && String(u.uid) === String(userUid))
            );
            if (localMatch && (localMatch.status === 'banned' || localMatch.status === 'suspended')) {
              isBanned = true;
              banReason = localMatch.statusReason || localMatch.notes || 'Violation of fair play or community rules.';
            }
          } catch (e) {
            console.warn('[AuthModal] Local status check error:', e);
          }
        }

        if (isBanned) {
          await supabase.auth.signOut();
          localStorage.removeItem('harshxo_user');
          localStorage.removeItem('harshxo_user_status');
          localStorage.removeItem('harshxo_user_status_reason');
          setErrorMsg(`Banned by admin: ${banReason}`);
          return;
        }

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

          {!isLogin && (
            <div className="auth-consent-group" style={{ margin: '14px 0 6px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
              <input 
                type="checkbox" 
                id="register-consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#ffaa00', cursor: 'pointer' }}
                required
              />
              <label htmlFor="register-consent" style={{ cursor: 'pointer' }}>
                I agree to the <Link to="/terms" target="_blank" style={{ color: '#ffaa00', textDecoration: 'underline' }}>Terms & Conditions</Link> and <Link to="/privacy-policy" target="_blank" style={{ color: '#ffaa00', textDecoration: 'underline' }}>Privacy Policy</Link>. I confirm that I am <strong>13 years or older</strong>.
              </label>
            </div>
          )}

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
              isLogin ? 'LOGIN' : 'CREATE ACCOUNT'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748b', margin: '12px 0 0' }}>
            We collect only minimal data strictly required to operate your gaming account.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
