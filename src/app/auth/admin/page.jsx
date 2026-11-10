'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeSwitcher from '../../component/theme-toggle';
// `import styles from './admin.module.css'` removed.
// Layout = same shared classes as the register / login pages (auth-*),
// plus a few small reusable `adm-*` classes from globals-admin-login.css.


const Svg = ({ children, size = 18, sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const SHIELD = 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const v = {};
    if (!form.email.trim()) v.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) v.email = 'Please enter a valid email address';
    if (!form.password.trim()) v.password = 'Password is required';
    else if (form.password.length < 6) v.password = 'Password must be at least 6 characters';
    return v;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setIsSubmitting(true);
    setErrors({});
    // TODO: replace with the real admin-auth API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => router.push('/admin-access'), 1200); // change to your console route
    }, 1200);
  };

  return (
    <div className="auth-page admin-login-page">
      
      <div
        className="auth-orb -left-[5%] -top-[10%] h-[580px] w-[580px] animate-[auth-float-orb_14s_ease-in-out_infinite_alternate]"
        aria-hidden="true"
      />
      <div
        className="auth-orb -bottom-[10%] -right-[5%] h-[580px] w-[580px] animate-[auth-float-orb_16s_ease-in-out_infinite_alternate-reverse]"
        aria-hidden="true"
      />
      <div className="auth-grid" aria-hidden="true" />

      <div className="auth-card min-h-[660px] max-w-[1040px] grid-cols-[1.05fr_1.15fr] animate-[auth-fade-in_0.4s_ease-out] max-[700px]:min-h-0 max-[700px]:max-w-[520px] max-[700px]:grid-cols-1 max-[520px]:rounded-[20px]">
        <div className="auth-toggle-slot absolute right-4 top-4 z-30"><ThemeSwitcher /></div>
        {/* ==================== LEFT: showcase ==================== */}
        <div className="auth-brand-side max-[700px]:hidden">
          <div className="auth-brand-glow" aria-hidden="true" />

          <div className="relative z-[2]">
            <div className="adm-tag">
              <Svg size={14} sw={2.5}><path d={SHIELD} /></Svg>
              <span>Restricted Access &bull; Level 1</span>
            </div>

            <h1 className="auth-brand-title">
              Administrative <br />
              <span className="auth-highlight-text">Security Console</span>
            </h1>
            <p className="adm-lead">
              Authorized gateway for infrastructure governance, platform metrics,
              role-based controls, and security audits.
            </p>

            <div className="adm-image-wrap">
              <div className="adm-live-badge">
                <span className="adm-live-dot" />
                <span>Secure gateway active</span>
              </div>
              <Image
                className="adm-image"
                src="/access.jpg"
                alt="Admin Access Security"
                width={520}
                height={300}
                style={{ height: 'auto' }}
                priority
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="adm-chip">
                <Svg size={13} sw={2.5}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>
                <span>256-Bit SSL</span>
              </div>
              <div className="adm-chip">
                <Svg size={13} sw={2.5}><path d={SHIELD} /></Svg>
                <span>RBAC Enforced</span>
              </div>
              <div className="adm-chip">
                <Svg size={13} sw={2.5}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></Svg>
                <span>Live Audit</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <div className="adm-footer-note">
              <Svg size={14}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></Svg>
              <span>All login activity and IP traces are encrypted &amp; monitored.</span>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT: form ==================== */}
        <div className="auth-form-side max-[700px]:px-7 max-[700px]:py-10">
          <div className="mb-7">
            <div className="adm-portal-badge">
              <span className="adm-dot" />
              <span>System Administrator Portal</span>
            </div>
            <h2 className="text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--text-primary)]">Admin Sign In</h2>
            <p className="text-[0.875rem] text-[var(--text-secondary)]">
              Enter your verified administrator credentials to access the management dashboard.
            </p>
          </div>

          <form className="flex flex-col gap-[1.15rem]" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-input-group">
              <label htmlFor="admin-email" className="auth-input-label">Email</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Svg size={20}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Svg>
                </span>
                <input
                  id="admin-email" type="email" name="email" className="auth-input"
                  placeholder="admin@enterprise.internal"
                  value={form.email} onChange={handleChange}
                  autoComplete="email" required
                />
              </div>
              {errors.email && <span className="adm-error">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="auth-input-group">
              <label htmlFor="admin-password" className="auth-input-label">Master Password</label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">
                  <Svg size={20}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>
                </span>
                <input
                  id="admin-password" type={showPassword ? 'text' : 'password'} name="password"
                  className="auth-input" placeholder="Enter secure password"
                  value={form.password} onChange={handleChange}
                  autoComplete="current-password" required
                />
                <button
                  type="button" className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <Svg><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></Svg>
                  ) : (
                    <Svg><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></Svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="adm-error">{errors.password}</span>}
            </div>

            {/* Remember + reset */}
            <div className="mt-[0.15rem] flex items-center justify-between max-[480px]:flex-col max-[480px]:items-start max-[480px]:gap-[0.65rem]">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox" name="rememberMe"
                  checked={form.rememberMe} onChange={handleChange}
                  className="h-4 w-4 cursor-pointer rounded-[4px] accent-[var(--accent)]"
                />
                <span className="select-none text-[0.8125rem] text-[var(--text-secondary)]">Remember this session (30d)</span>
              </label>
              <Link href="/auth/forgot-password" className="auth-link !ml-0 !text-[0.8125rem]">
                Reset credentials?
              </Link>
            </div>

            <button
              type="submit"
              className="auth-submit-btn mb-2 mt-[0.95rem] rounded-[13px] bg-[linear-gradient(135deg,#fb0d0d_0%,#ff0a0a_100%)]"
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <>
                  <span className="auth-spinner" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <Svg sw={2.5}><path d={SHIELD} /><polyline points="9 12 11 14 15 10" /></Svg>
                  <span>Authorize &amp; Enter Console</span>
                </>
              )}
            </button>
          </form>
          <div className="adm-bottom-nav">
            <span>Not an administrator?</span>
            <Link href="/" className="auth-link !ml-0 !text-[var(--text-primary)]">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}