import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Wind,
  ShieldCheck,
  Github,
  Chrome,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import './Login.css';

const EASE = [0.16, 1, 0.3, 1];

function FloatingField({ icon: Icon, label, type = 'text', value, onChange, name, autoComplete, right }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <label className={`field ${active ? 'is-active' : ''}`}>
      <span className="field__icon"><Icon size={18} /></span>
      <span className="field__body">
        <span className="field__label">{label}</span>
        <input
          type={type}
          name={name}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required
        />
      </span>
      {right}
    </label>
  );
}

function strengthOf(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['#EF4444', '#EF4444', '#F59E0B', '#38BDF8', '#22C55E'];

function PasswordStrength({ value }) {
  const score = value ? strengthOf(value) : 0;

  return (
    <div className="strength">
      <div className="strength__bars">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="strength__bar"
            style={{
              background: i < score ? STRENGTH_COLOR[score] : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>
      <span
        className="strength__label"
        style={{
          color: value ? STRENGTH_COLOR[score] : 'rgba(255, 255, 255, 0.6)',
        }}
      >
        {value ? STRENGTH_LABEL[score] : 'Password strength'}
      </span>
    </div>
  );
}

function OtpInput({ value, onChange }) {
  const refs = useRef([]);

  return (
    <div className="otp">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className="otp__box"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(-1);
            const next = [...value];
            next[i] = v;
            onChange(next);
            if (v && refs.current[i + 1]) refs.current[i + 1].focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digit && refs.current[i - 1]) {
              refs.current[i - 1].focus();
            }
          }}
        />
      ))}
    </div>
  );
}

function EnvironmentalVisual() {
  return (
    <div className="eco-visual" aria-hidden="true">
      <div className="eco-visual__glow" />
      <div className="eco-visual__mesh" />

      {/* Atmospheric intelligence stream SVG */}
      <svg className="eco-visual__waves" viewBox="0 0 460 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ecoStream1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2ED3FF" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#24D66D" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="ecoStream2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#24D66D" stopOpacity="0.65" />
            <stop offset="60%" stopColor="#2ED3FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="ecoAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2ED3FF" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#24D66D" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Ambient filled area */}
        <path
          d="M0 140 C80 100 150 170 230 120 C310 70 380 150 460 95 L460 220 L0 220 Z"
          fill="url(#ecoAreaGrad)"
          className="wave-area"
        />

        {/* Primary flowing wave streams */}
        <path
          d="M-20 140 C70 95 145 165 230 115 C315 65 385 145 480 90"
          stroke="url(#ecoStream1)"
          strokeWidth="2.2"
          strokeLinecap="round"
          className="wave-stream wave-stream--1"
        />
        <path
          d="M-20 165 C60 125 150 190 240 140 C330 90 395 165 480 115"
          stroke="url(#ecoStream2)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          strokeLinecap="round"
          className="wave-stream wave-stream--2"
        />
        <path
          d="M-20 115 C75 75 160 145 250 95 C340 45 410 120 480 70"
          stroke="url(#ecoStream1)"
          strokeWidth="1.2"
          strokeOpacity="0.35"
          className="wave-stream wave-stream--3"
        />

        {/* Environmental telemetry sensor nodes */}
        <circle cx="145" cy="165" r="4" className="eco-node eco-node--1" />
        <circle cx="230" cy="115" r="4.5" className="eco-node eco-node--2" />
        <circle cx="315" cy="65" r="3.5" className="eco-node eco-node--3" />
        <circle cx="385" cy="145" r="4" className="eco-node eco-node--4" />
      </svg>

      {/* Floating Telemetry Metric Chips */}
      <div className="eco-chip eco-chip--top">
        <span className="eco-chip__pulse" />
        <span className="eco-chip__label">Atmospheric Intelligence</span>
        <span className="eco-chip__val">99.4% precision</span>
      </div>

      <div className="eco-chip eco-chip--bottom">
        <span className="eco-chip__pulse eco-chip__pulse--green" />
        <span className="eco-chip__label">Environmental Telemetry</span>
        <span className="eco-chip__val eco-chip__val--green">Live</span>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [successFor, setSuccessFor] = useState('signin');

  const [signInEmail, setSignInEmail] = useState('ayushmaan@climateguardian.in');
  const [signInPassword, setSignInPassword] = useState('');
  const [remember, setRemember] = useState(true);

  const [name, setName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);

  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const signInValid = signInEmail.trim().length > 0 && signInPassword.length > 0;
  const signUpValid =
    name.trim().length > 0 &&
    signUpEmail.trim().length > 0 &&
    signUpPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    signUpPassword === confirmPassword &&
    agree;
  const forgotEmailReady = forgotEmail.trim().length > 0;
  const otpComplete = otp.every((digit) => digit !== '');
  const resetValid = newPassword.length >= 8 && confirmNewPassword.length > 0 && newPassword === confirmNewPassword;

  function handleSignIn(e) {
    e.preventDefault();
    if (!signInValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessFor('signin');
      setView('success');
      setTimeout(() => navigate('/dashboard'), 1100);
    }, 700);
  }

  function handleSignUp(e) {
    e.preventDefault();
    if (!signUpValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessFor('signup');
      setView('success');
      setTimeout(() => navigate('/dashboard'), 1300);
    }, 800);
  }

  function handleForgotEmail(e) {
    e.preventDefault();
    if (!forgotEmailReady) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('forgot-otp');
    }, 600);
  }

  function handleVerifyOtp(e) {
    e.preventDefault();
    if (!otpComplete) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('forgot-reset');
    }, 600);
  }

  function handleResetPassword(e) {
    e.preventDefault();
    if (!resetValid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('forgot-success');
    }, 600);
  }

  const isAuthForm = view === 'signin' || view === 'signup';
  const isSuccessView = view === 'success' || view === 'forgot-success';

  return (
    <AuthLayout>
      <div className="login">
        <div className="login__illustration">
          <EnvironmentalVisual />

          <motion.div
            className="login__illustration-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
          >
            <span className="login__illus-badge">
              <ShieldCheck size={14} /> AI-powered forecasting
            </span>
            <h3>
              Your Journey Towards a <span className="hero-highlight">Greener Future</span> Starts Here.
            </h3>
            <p>
              ClimateGuardian combines Artificial Intelligence, environmental monitoring, carbon footprint analysis, and sustainability insights into one intelligent platform designed to help people make better decisions for the planet.
            </p>
            <div className="login__illus-stats">
              <div>
                <span>AI</span>
                <small>Prediction Engine</small>
              </div>
              <div>
                <span>Carbon</span>
                <small>Footprint Tracking</small>
              </div>
              <div>
                <span>24/7</span>
                <small>Environmental Monitoring</small>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="login__form-wrap">
          <motion.div
            className="login__form-content"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.14 }}
          >
            {!isSuccessView && (
              <div className="login__brand">
                <span className="login__brand-icon"><Wind size={18} /></span>
                ClimateGuardian
              </div>
            )}

            {isAuthForm && (
              <div className="tabs" role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === 'signin'}
                  className={`tabs__btn ${view === 'signin' ? 'is-active' : ''}`}
                  onClick={() => setView('signin')}
                >
                  {view === 'signin' && (
                    <motion.span
                      layoutId="authTab"
                      className="tabs__pill"
                      transition={{ duration: 0.3, ease: EASE }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="tabs__label">Sign In</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === 'signup'}
                  className={`tabs__btn ${view === 'signup' ? 'is-active' : ''}`}
                  onClick={() => setView('signup')}
                >
                  {view === 'signup' && (
                    <motion.span
                      layoutId="authTab"
                      className="tabs__pill"
                      transition={{ duration: 0.3, ease: EASE }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="tabs__label">Create Account</span>
                </button>
              </div>
            )}

            <div className="login__panel-area">
              <AnimatePresence mode="wait">
            {view === 'signin' && (
              <motion.form key="signin" className="login__panel" onSubmit={handleSignIn} {...panelMotion}>
                <h2>Welcome Back </h2>
                <p className="login__subtitle">
                  Access your ClimateGuardian workspace and continue your sustainability journey.
                </p>
                <FloatingField
                  icon={Mail}
                  label="Email address"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={signInEmail}
                  onChange={setSignInEmail}
                />
                <FloatingField
                  icon={Lock}
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={signInPassword}
                  onChange={setSignInPassword}
                  right={(
                    <button
                      type="button"
                      className="field__eye"
                      onClick={() => setShowPw((value) => !value)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                />
                <div className="login__row">
                  <label className="login__remember">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <button type="button" className="login__forgot" onClick={() => setView('forgot-email')}>
                    Forgot password?
                  </button>
                </div>
                <button className="login__submit" type="submit" disabled={loading || !signInValid}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Signing in…
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <Divider />
                <SocialButtons />
                <p className="login__footnote">Protected access for verified environmental accounts across India.</p>
              </motion.form>
            )}

            {view === 'signup' && (
              <motion.form key="signup" className="login__panel" onSubmit={handleSignUp} {...panelMotion}>
                <h2>Create Your Account</h2>
                <p className="login__subtitle">
                  Join thousands of people building a cleaner, healthier and more sustainable tomorrow.
                </p>
                <FloatingField
                  icon={Mail}
                  label="Full name"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={setName}
                />
                <FloatingField
                  icon={Mail}
                  label="Email address"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={signUpEmail}
                  onChange={setSignUpEmail}
                />
                <FloatingField
                  icon={Lock}
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  autoComplete="new-password"
                  value={signUpPassword}
                  onChange={setSignUpPassword}
                  right={(
                    <button
                      type="button"
                      className="field__eye"
                      onClick={() => setShowPw((value) => !value)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                />
                <PasswordStrength value={signUpPassword} />
                <FloatingField
                  icon={Lock}
                  label="Confirm password"
                  type={showPw2 ? 'text' : 'password'}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  right={(
                    <button
                      type="button"
                      className="field__eye"
                      onClick={() => setShowPw2((value) => !value)}
                      aria-label={showPw2 ? 'Hide password' : 'Show password'}
                    >
                      {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                />
                {confirmPassword.length > 0 && confirmPassword !== signUpPassword && (
                  <span className="field__error">Passwords don't match</span>
                )}
                <label className="login__terms">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  I agree to the <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>
                </label>
                <button className="login__submit" type="submit" disabled={loading || !signUpValid}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Creating account…
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <Divider />
                <button type="button" className="btn-social">
                  <Chrome size={16} /> Continue with Google
                </button>
              </motion.form>
            )}

            {view === 'forgot-email' && (
              <motion.form key="forgot-email" className="login__panel" onSubmit={handleForgotEmail} {...panelMotion}>
                <BackButton onClick={() => setView('signin')} />
                <h2>Recover Your Account</h2>
                <p className="login__subtitle">Enter your registered email to securely reset your password.</p>
                <FloatingField
                  icon={Mail}
                  label="Email address"
                  type="email"
                  name="forgotEmail"
                  autoComplete="email"
                  value={forgotEmail}
                  onChange={setForgotEmail}
                />
                <button className="login__submit" type="submit" disabled={loading || !forgotEmailReady}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Sending code…
                    </>
                  ) : (
                    <>
                      Send verification code <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {view === 'forgot-otp' && (
              <motion.form key="forgot-otp" className="login__panel" onSubmit={handleVerifyOtp} {...panelMotion}>
                <BackButton onClick={() => setView('forgot-email')} />
                <h2>Enter verification code</h2>
                <p className="login__subtitle">We sent a 6-digit code to {forgotEmail || 'your email'}.</p>
                <OtpInput value={otp} onChange={setOtp} />
                <button className="login__submit" type="submit" disabled={loading || !otpComplete}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Verifying…
                    </>
                  ) : (
                    <>
                      Verify code <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <p className="login__footnote">
                  Didn't get a code?{' '}
                  <button type="button" className="login__forgot" onClick={() => setOtp(['', '', '', '', '', ''])}>
                    Resend
                  </button>
                </p>
              </motion.form>
            )}

            {view === 'forgot-reset' && (
              <motion.form key="forgot-reset" className="login__panel" onSubmit={handleResetPassword} {...panelMotion}>
                <BackButton onClick={() => setView('forgot-otp')} />
                <h2>Create new password</h2>
                <p className="login__subtitle">Make it something you haven't used before.</p>
                <FloatingField
                  icon={Lock}
                  label="New password"
                  type={showPw ? 'text' : 'password'}
                  name="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={setNewPassword}
                  right={(
                    <button
                      type="button"
                      className="field__eye"
                      onClick={() => setShowPw((value) => !value)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                />
                <PasswordStrength value={newPassword} />
                <FloatingField
                  icon={Lock}
                  label="Confirm new password"
                  type={showPw2 ? 'text' : 'password'}
                  name="confirmNewPassword"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={setConfirmNewPassword}
                  right={(
                    <button
                      type="button"
                      className="field__eye"
                      onClick={() => setShowPw2((value) => !value)}
                      aria-label={showPw2 ? 'Hide password' : 'Show password'}
                    >
                      {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                />
                {confirmNewPassword.length > 0 && confirmNewPassword !== newPassword && (
                  <span className="field__error">Passwords don't match</span>
                )}
                <button className="login__submit" type="submit" disabled={loading || !resetValid}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" /> Saving…
                    </>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </motion.form>
            )}

            {view === 'forgot-success' && (
              <motion.div key="forgot-success" className="login__panel login__success" {...panelMotion}>
                <div className="login__brand">
                  <span className="login__brand-icon"><Wind size={18} /></span>
                  ClimateGuardian
                </div>
                <SuccessIcon />
                <h2>Password reset</h2>
                <p className="login__subtitle">Your password has been updated. Sign in with your new password.</p>
                <button className="login__submit" type="button" onClick={() => setView('signin')} style={{ marginTop: '20px' }}>
                  Back to Sign In <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {view === 'success' && (
              <motion.div key="success" className="login__panel login__success" {...panelMotion}>
                <div className="login__brand">
                  <span className="login__brand-icon"><Wind size={18} /></span>
                  ClimateGuardian
                </div>
                <SuccessIcon />
                <h2>{successFor === 'signup' ? 'Account created' : 'Authentication successful'}</h2>
                <p className="login__subtitle">Preparing your personalized sustainability dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  </AuthLayout>
  );
}

const panelMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: EASE },
};

function BackButton({ onClick }) {
  return (
    <button type="button" className="login__back" onClick={onClick}>
      <ArrowLeft size={14} /> Back
    </button>
  );
}

function Divider() {
  return <div className="divider"><span>or</span></div>;
}

function SocialButtons() {
  return (
    <div className="social-row">
      <button type="button" className="btn-social">
        <Chrome size={16} /> Google
      </button>
      <button type="button" className="btn-social">
        <Github size={16} /> GitHub
      </button>
    </div>
  );
}

function SuccessIcon() {
  return (
    <motion.span
      className="success-icon"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <CheckCircle2 size={30} />
    </motion.span>
  );
}
