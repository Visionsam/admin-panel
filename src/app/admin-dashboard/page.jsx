'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import ThemeSwitcher from '../component/theme-toggle';
import Sidebar from '@/app/component/Sidebar';
// Overview dashboard. User management is NOT here (it has its own page).
// Styles: `dash-*` + shared `um-*` / `sb-*` classes in app/globals.css (see globals-dashboard.css).
// All numbers below are demo data: replace `getDashboardData()` with your API call.

/* ------------------------------------------------------------------ */
/* Demo data (deterministic: no Math.random, so no hydration mismatch) */
/* ------------------------------------------------------------------ */
const RANGES = [
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '90 days', days: 90 },
];

function getDashboardData(days) {
  const bookings = [];
  const signups = [];
  for (let i = 0; i < days; i++) {
    const wave = Math.sin((i / days) * Math.PI * 3.2) * 6;
    bookings.push(Math.round(38 + wave + (i % 7 === 5 || i % 7 === 6 ? 9 : 0) + (i * 18) / days));
    signups.push(Math.round(12 + Math.cos((i / days) * Math.PI * 2.4) * 4 + (i * 6) / days));
  }
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  return {
    kpis: {
      totalUsers: { value: 12480, delta: 8.2 },
      customers: { value: 11236, delta: 7.9 },
      mechanics: { value: 1244, delta: 12.4 },
      pending: { value: 37, delta: -5.1 },
      bookings: { value: sum(bookings), delta: 14.6, suffix: `in last ${days} days` },
    },
    bookings,
    signups,
  };
}

const POPULAR_SERVICES = [
  { name: 'Screen replacement', count: 1284 },
  { name: 'Backlight / panel repair', count: 962 },
  { name: 'Power board repair', count: 741 },
  { name: 'Software / firmware fix', count: 603 },
  { name: 'Wall-mount installation', count: 455 },
  { name: 'Sound & HDMI issues', count: 318 },
];

const ACTIVITIES = [
  { id: 1, type: 'booking', text: 'New booking #BK-20418 for Screen replacement', who: 'Priya Sharma', time: '2 min ago' },
  { id: 2, type: 'mechanic', text: 'Mechanic registration submitted, awaiting review', who: 'Rahul Electronics', time: '14 min ago' },
  { id: 3, type: 'done', text: 'Booking #BK-20409 marked completed', who: 'Anil Kumar', time: '31 min ago' },
  { id: 4, type: 'approval', text: 'Mechanic profile approved', who: 'TV Care Centre', time: '1 hr ago' },
  { id: 5, type: 'cancel', text: 'Booking #BK-20397 was cancelled by the customer', who: 'Sneha Reddy', time: '2 hr ago' },
  { id: 6, type: 'booking', text: 'New booking #BK-20395 for Power board repair', who: 'Mohit Verma', time: '3 hr ago' },
  { id: 7, type: 'mechanic', text: 'Mechanic registration submitted, awaiting review', who: 'Sai Display Works', time: '5 hr ago' },
];

const ACTIVITY_META = {
  booking: { label: 'Booking', tone: 'blue', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
  mechanic: { label: 'Mechanic', tone: 'amber', icon: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></> },
  done: { label: 'Booking', tone: 'green', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> },
  approval: { label: 'Mechanic', tone: 'green', icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></> },
  cancel: { label: 'Booking', tone: 'red', icon: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></> },
};

const nf = new Intl.NumberFormat('en-IN');

/* ---- tiny helpers ---- */
const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

/* ------------------------------------------------------------------ */
/* KPI card                                                           */
/* ------------------------------------------------------------------ */
function Kpi({ label, value, delta, hint, tone = 'red', icon, href, cta, goodWhenDown = false }) {
  const up = delta >= 0;
  const good = goodWhenDown ? !up : up; // fewer pending approvals is good news
  return (
    <div className="dash-kpi" data-tone={tone}>
      <div className="dash-kpi-top">
        <span className="dash-kpi-icon"><Icon>{icon}</Icon></span>
        <span className="dash-kpi-label">{label}</span>
      </div>
      <div className="dash-kpi-value">{nf.format(value)}</div>
      <div className="dash-kpi-foot">
        {typeof delta === 'number' && (
          <span className="dash-delta" data-up={good}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
            </svg>
            {Math.abs(delta)}%
          </span>
        )}
        <span className="dash-kpi-hint">{hint}</span>
        {href && <Link href={href} className="dash-kpi-link">{cta}</Link>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Area / line chart (inline SVG, hover tooltip)                      */
/* ------------------------------------------------------------------ */
function TrendChart({ bookings, signups }) {
  const [hover, setHover] = useState(null);
  const W = 640, H = 260, L = 38, R = 12, T = 14, B = 28;
  const n = bookings.length;
  const max = niceMax(Math.max(...bookings, ...signups) * 1.08);
  const x = (i) => L + (i * (W - L - R)) / (n - 1);
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const line = (arr) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${line(bookings)} L${x(n - 1)},${H - B} L${x(0)},${H - B} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(max * t));
  const labelEvery = n <= 7 ? 1 : n <= 30 ? 5 : 15;
  const step = (W - L - R) / (n - 1);

  return (
    <div className="dash-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Bookings and new sign-ups for the last ${n} days. Latest day: ${bookings[n - 1]} bookings, ${signups[n - 1]} sign-ups.`}
        onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="dash-grid" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="dash-axis">{t}</text>
          </g>
        ))}
        {bookings.map((_, i) => (i % labelEvery === 0 || i === n - 1) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="dash-axis">
            {n - 1 - i === 0 ? 'Today' : `-${n - 1 - i}d`}
          </text>
        ))}
        <path d={area} fill="url(#dashArea)" />
        <path d={line(bookings)} className="dash-line dash-line-main" />
        <path d={line(signups)} className="dash-line dash-line-alt" />
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} className="dash-cross" />
            <circle cx={x(hover)} cy={y(bookings[hover])} r="4.5" className="dash-dot dash-dot-main" />
            <circle cx={x(hover)} cy={y(signups[hover])} r="4.5" className="dash-dot dash-dot-alt" />
          </g>
        )}
        {bookings.map((_, i) => (
          <rect key={i} x={x(i) - step / 2} y={T} width={step} height={H - T - B} fill="transparent"
            onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)} />
        ))}
      </svg>

      {hover !== null && (
        <div className="dash-tip" style={{ left: `${(x(hover) / W) * 100}%` }} role="status">
          <strong>{n - 1 - hover === 0 ? 'Today' : `${n - 1 - hover} days ago`}</strong>
          <span><i className="dash-swatch dash-swatch-main" /> Bookings <b>{bookings[hover]}</b></span>
          <span><i className="dash-swatch dash-swatch-alt" /> New sign-ups <b>{signups[hover]}</b></span>
        </div>
      )}

      {/* screen-reader / keyboard users get the numbers as a table */}
      <table className="sr-only">
        <caption>Daily bookings and sign-ups</caption>
        <thead><tr><th>Day</th><th>Bookings</th><th>Sign-ups</th></tr></thead>
        <tbody>{bookings.map((b, i) => <tr key={i}><td>{n - i} days ago</td><td>{b}</td><td>{signups[i]}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function page() {
  const [range, setRange] = useState('30d');
  const [filter, setFilter] = useState('all');
  const days = RANGES.find((r) => r.key === range).days;
  const data = useMemo(() => getDashboardData(days), [days]);
  const topCount = POPULAR_SERVICES[0].count;
  const totalServices = POPULAR_SERVICES.reduce((a, s) => a + s.count, 0);

  const activities = ACTIVITIES.filter((a) =>
    filter === 'all' ? true : filter === 'bookings' ? ['booking', 'done', 'cancel'].includes(a.type) : ['mechanic', 'approval'].includes(a.type));

  const k = data.kpis;

  return (
    <div className="um-layout ">
      <Sidebar active="dashboard" />
      <main className="um-main">
        <div className="um-container overflow-hidden">

          {/* ---------- header ---------- */}
          <header className="um-card um-header">
            <div>
              <h1 className="dash-title">Dashboard</h1>
              <p className="dash-subtitle">Platform overview: customers, mechanics, bookings and activity.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="dash-seg" role="group" aria-label="Time range">
                {RANGES.map((r) => (
                  <button key={r.key} type="button" data-active={range === r.key}
                    aria-pressed={range === r.key} onClick={() => setRange(r.key)}>
                    {r.label}
                  </button>
                  
                ))}
              </div>
                  <ThemeSwitcher/>
            </div>
            
          </header>

          {/* ---------- KPI cards ---------- */}
          <section className="dash-kpis" aria-label="Key numbers">
            <Kpi label="Total users" value={k.totalUsers.value} delta={k.totalUsers.delta} hint="vs previous period" tone="red"
              icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />
            <Kpi label="Total customers" value={k.customers.value} delta={k.customers.delta} hint="vs previous period" tone="blue"
              icon={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />
            <Kpi label="Registered mechanics" value={k.mechanics.value} delta={k.mechanics.delta} hint="vs previous period" tone="green"
              icon={<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />} />
            <Kpi label="Pending approvals" value={k.pending.value} delta={k.pending.delta} hint="mechanics waiting" tone="amber"
              href="/admin/approvals" cta="Review" goodWhenDown
              icon={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>} />
            <Kpi label="Total bookings" value={k.bookings.value} delta={k.bookings.delta} hint={k.bookings.suffix} tone="violet"
              icon={<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>} />
          </section>

          {/* ---------- analytics + popular services ---------- */}
          <section className="dash-grid-2">
            <article className="um-card dash-panel">
              <div className="dash-panel-head">
                <div>
                  <h2 className="dash-h2">Platform analytics</h2>
                  <p className="dash-muted">Bookings and new sign-ups per day</p>
                </div>
                <div className="dash-legend">
                  <span><i className="dash-swatch dash-swatch-main" /> Bookings</span>
                  <span><i className="dash-swatch dash-swatch-alt" /> New sign-ups</span>
                </div>
              </div>
              <TrendChart bookings={data.bookings} signups={data.signups} />
            </article>

            <article className="um-card dash-panel">
              <div className="dash-panel-head">
                <div>
                  <h2 className="dash-h2">Popular services</h2>
                  <p className="dash-muted">Most booked, all time</p>
                </div>
              </div>
              <ol className="dash-rank">
                {POPULAR_SERVICES.map((s, i) => (
                  <li key={s.name}>
                    <div className="dash-rank-row">
                      <span className="dash-rank-n">{i + 1}</span>
                      <span className="dash-rank-name">{s.name}</span>
                      <span className="dash-rank-count">{nf.format(s.count)}</span>
                    </div>
                    <div className="dash-bar" role="presentation">
                      <span style={{ width: `${(s.count / topCount) * 100}%`, animationDelay: `${i * 70}ms` }} />
                    </div>
                    <span className="sr-only">{Math.round((s.count / totalServices) * 100)} percent of bookings</span>
                  </li>
                ))}
              </ol>
            </article>
          </section>

          {/* ---------- recent activities ---------- */}
          <section className="um-card dash-panel" aria-labelledby="recent-h">
            <div className="dash-panel-head">
              <div>
                <h2 id="recent-h" className="dash-h2">Recent activities</h2>
                <p className="dash-muted">Latest events across the platform</p>
              </div>
              <div className="dash-seg" role="group" aria-label="Filter activities">
                {[['all', 'All'], ['bookings', 'Bookings'], ['mechanics', 'Mechanics']].map(([key, label]) => (
                  <button key={key} type="button" data-active={filter === key}
                    aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
                ))}
              </div>
            </div>

            {activities.length === 0 ? (
              <p className="dash-empty">No recent activity for this filter.</p>
            ) : (
              <ul className="dash-feed">
                {activities.map((a, i) => {
                  const m = ACTIVITY_META[a.type];
                  return (
                    <li key={a.id} style={{ animationDelay: `${i * 50}ms` }}>
                      <span className="dash-feed-icon" data-tone={m.tone}><Icon size={16}>{m.icon}</Icon></span>
                      <div className="dash-feed-body">
                        <p>{a.text}</p>
                        <span>{a.who}</span>
                      </div>
                      <time>{a.time}</time>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}