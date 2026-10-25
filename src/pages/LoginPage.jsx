import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, User as UserIcon, Hash, Lock,
  Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Gamepad2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGame } from '../context/GameContext';
import './LoginPage.css';

const LoginPage = () => {
  const { setUser } = useGame();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (error) {
          if (error.message?.toLowerCase().includes('email not confirmed')) {
            throw new Error('Please verify your email address before logging in. Check your inbox/spam for the confirmation link.');
          }
          if (error.message?.toLowerCase().includes('invalid login credentials') ||
              error.message?.toLowerCase().includes('invalid email or password')) {
            throw new Error('Incorrect email or password. Please try again.');
          }
          throw error;
        }

        const user = data.user;
        const metadata = user.user_metadata || user.raw_user_meta_data || {};
        const profile = {
          id: user.id,
          email: user.email,
          inGameName: metadata.inGameName || metadata.in_game_name || user.email?.split('@')[0] || 'Survivor',
          uid: metadata.gameUid || metadata.game_uid || 'XO-' + user.id.slice(0, 8),
        };
        setUser(profile);
        navigate(from, { replace: true });

      } else {
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

        if (data.session && data.user) {
          const user = data.user;
          const metadata = user.user_metadata || user.raw_user_meta_data || {};
          const profile = {
            id: user.id,
            email: user.email,
            inGameName: metadata.inGameName || formData.inGameName || user.email?.split('@')[0] || 'Survivor',
            uid: metadata.gameUid || formData.gameUid || 'XO-' + user.id.slice(0, 8),
          };
          setUser(profile);
          navigate(from, { replace: true });
        } else {
          setSuccessMsg('Account created! Please check your email to confirm your account, then log in.');
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
    <div className="login-page">
      {/* Animated background particles */}
      <div className="lp-bg-particles">
        {[...Array(12)].map((_, i) => (
          <span key={i} className="lp-particle" style={{ '--i': i }} />
        ))}
      </div>

      <div className="lp-card glass-panel">
        {/* Logo / Branding */}
        <div className="lp-brand">
          <div className="lp-logo-ring">
            <Gamepad2 size={32} className="lp-logo-icon" />
          </div>
          <h1 className="lp-brand-name text-gradient">HAARSH XO</h1>
          <p className="lp-brand-sub">ESPORTS PLATFORM</p>
        </div>

        {/* Tab toggle */}
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

        <h2 className="lp-title">
          {isLogin ? 'WELCOME BACK 👊' : 'JOIN HAARSH XO 🎮'}
        </h2>

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

        <form onSubmit={handleSubmit} className="auth-form">
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

          <div className="input-group password-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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

        <div className="lp-footer-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span>·</span>
          <Link to="/terms">Terms</Link>
          <span>·</span>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
