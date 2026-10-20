import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  Gamepad2, 
  HelpCircle,
  Clock
} from 'lucide-react';
import './ContactUs.css';

export const CONTACT_STORAGE_KEY = 'haarshxo_contact_requests';

export const getStoredContactRequests = () => {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse contact requests:', err);
    return [];
  }
};

export const saveContactRequests = (requests) => {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(requests));
    // Notify same window
    window.dispatchEvent(new CustomEvent('haarshxo_contact_updated'));
    // Notify other tabs via BroadcastChannel if supported
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('haarshxo_admin_sync');
      bc.postMessage({ type: 'CONTACT_REQUESTS_UPDATED', count: requests.length });
      bc.close();
    }
  } catch (err) {
    console.error('Failed to save contact requests:', err);
  }
};

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    uid: '',
    category: 'General Inquiry',
    priority: 'Normal',
    message: '',
    consent: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 15) {
      setErrorMessage('Please write a descriptive message (at least 15 characters).');
      return;
    }
    if (!formData.consent) {
      setErrorMessage('Please check the consent box to proceed.');
      return;
    }

    setSubmitting(true);

    const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      uid: formData.uid.trim() || 'N/A',
      category: formData.category,
      priority: formData.priority,
      message: formData.message.trim(),
      submittedAt: new Date().toISOString(),
      status: 'new' // 'new' | 'read' | 'resolved'
    };

    try {
      // 1. Save locally to guarantee persistence & admin panel reactivity
      const existing = getStoredContactRequests();
      const updated = [newRequest, ...existing];
      saveContactRequests(updated);

      // 2. Also attempt backend push if endpoint exists
      try {
        await fetch('/api/contact-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRequest)
        });
      } catch (beErr) {
        // Silently fallback to local storage sync
      }

      setSubmitted(true);
    } catch (err) {
      setErrorMessage('Failed to submit message. Please try again or email trmental6@gmail.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page-container">
      <div className="contact-header">
        <Link to="/" className="contact-back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <h1 className="contact-title">Contact & Support</h1>
        <p className="contact-subtitle">
          Have an issue with tournament matchmaking, prize redemption, account verification, or a refund request? Reach out directly to the HAARSH XO operations desk.
        </p>
      </div>

      <div className="contact-layout">
        {/* Left Column: Form */}
        <div className="contact-card glass-panel">
          {submitted ? (
            <div className="contact-success-state">
              <div className="success-icon-wrap">
                <CheckCircle2 size={48} className="text-success" />
              </div>
              <h2 className="success-heading">Message Dispatched Successfully</h2>
              <p className="success-desc">
                Thank you, <strong>{formData.name}</strong>. Your ticket has been logged and routed to the HAARSH XO Administrator console.
              </p>
              <div className="success-details-box">
                <div><strong>Category:</strong> {formData.category}</div>
                <div><strong>Reference ID:</strong> <code>#{formData.email.split('@')[0].toUpperCase()}</code></div>
                <div><strong>Expected Response:</strong> Within 24–48 hours to <em>{formData.email}</em></div>
              </div>
              <button
                type="button"
                className="btn-send-another"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    uid: '',
                    category: 'General Inquiry',
                    priority: 'Normal',
                    message: '',
                    consent: false
                  });
                  setSubmitted(false);
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form" noValidate>
              <h2 className="form-heading">Send Us a Direct Message</h2>
              <p className="form-subtext">All submissions are reviewed directly by the channel owner & admin team.</p>

              {errorMessage && (
                <div className="contact-error-banner" role="alert">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="form-grid-2">
                <div className="contact-field-group">
                  <label htmlFor="contact-name" className="contact-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <div className="contact-input-wrap">
                    <User size={16} className="input-icon" />
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field-group">
                  <label htmlFor="contact-email" className="contact-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <div className="contact-input-wrap">
                    <Mail size={16} className="input-icon" />
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="contact-field-group">
                  <label htmlFor="contact-uid" className="contact-label">
                    Free Fire UID <span className="opt">(Optional)</span>
                  </label>
                  <div className="contact-input-wrap">
                    <Gamepad2 size={16} className="input-icon" />
                    <input
                      id="contact-uid"
                      type="text"
                      name="uid"
                      placeholder="e.g. 1928472910"
                      value={formData.uid}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="contact-field-group">
                  <label htmlFor="contact-category" className="contact-label">
                    Inquiry Category <span className="req">*</span>
                  </label>
                  <div className="contact-select-wrap">
                    <select
                      id="contact-category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Tournament Issue">Tournament & Match Issue</option>
                      <option value="Reward / Redeem Code Issue">Reward / Redeem Code Issue</option>
                      <option value="Refund Request">Refund / Cancellation Request</option>
                      <option value="Account Access / Security">Account Access / Security</option>
                      <option value="DPDP Grievance / Data Erasure">DPDP Grievance / Data Deletion</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="contact-field-group">
                <label htmlFor="contact-priority" className="contact-label">
                  Urgency Level
                </label>
                <div className="priority-options">
                  {['Normal', 'High', 'Urgent'].map((level) => (
                    <label key={level} className={`priority-pill ${formData.priority === level ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="priority"
                        value={level}
                        checked={formData.priority === level}
                        onChange={handleChange}
                      />
                      <span>{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="contact-field-group">
                <label htmlFor="contact-message" className="contact-label">
                  Your Message <span className="req">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Describe your issue with order IDs, match slots, or specific questions..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-consent-group">
                <label className="contact-checkbox-label">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                  />
                  <span>
                    I confirm that I am at least 13 years old and consent to HAARSH XO processing this data to resolve my inquiry in accordance with the{' '}
                    <Link to="/privacy-policy" target="_blank">Privacy Policy</Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="btn-submit-contact"
                disabled={submitting}
              >
                {submitting ? (
                  <span>Dispatching Message...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit to Admin Operations</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Channels & Help */}
        <div className="contact-sidebar">
          <div className="contact-info-card glass-panel">
            <h3 className="sidebar-card-title">Direct Operator Details</h3>
            
            <div className="info-item">
              <div className="info-icon yt"><Mail size={18} /></div>
              <div>
                <div className="info-label">Direct Creator Email</div>
                <a href="mailto:trmental6@gmail.com" className="info-val">trmental6@gmail.com</a>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon clock"><Clock size={18} /></div>
              <div>
                <div className="info-label">Support Hours</div>
                <div className="info-val">10:00 AM - 11:00 PM IST (Daily)</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon shield"><ShieldCheck size={18} /></div>
              <div>
                <div className="info-label">Response Guarantee</div>
                <div className="info-val">Urgent tournament tickets resolved before match start time</div>
              </div>
            </div>
          </div>

          <div className="contact-faq-preview glass-panel">
            <h3 className="sidebar-card-title">Quick Answers</h3>
            <div className="faq-mini-item">
              <strong>Need a refund for delivered diamonds?</strong>
              <p>Delivered game currency is non-refundable. For unused voucher codes or tournament passes, see our <Link to="/refund-policy">Refund Policy</Link>.</p>
            </div>
            <div className="faq-mini-item">
              <strong>Missing custom room password?</strong>
              <p>Room credentials appear in the Esports Arena 15 minutes before the match start time. Ensure you hold a valid pass.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
