"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// Styles: reusable `sb-*` classes in app/globals.css (see globals-users-admin.css).
// Icons are inline SVG, so the /icons/*.svg files are no longer needed.

const Icon = ({ children }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
);

// Change the hrefs to your real routes.
const NAV = [
    { key: "dashboard", label: "Dashboard", href: "/admin-dashboard",
      icon: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></> },
    { key: "users", label: "Users", href: "/admin-access",
      icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
    {
        key: "leds", label: "Leads", href: "",
      icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>},
    { key: "accounts", label: "Accounts", href: "/admin/accounts",
      icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></> },
    { key: "statistics", label: "Statistics", href: "/admin/statistics",
      icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></> },
];

export default function Sidebar({ active = "dashboard" }) {
    const [isOpen, setIsOpen] = useState(false);          // mobile drawer
    const [collapsed, setCollapsed] = useState(false);      // desktop: slim icon-only mode

    return (
        <>
            {/* Mobile hamburger */}
            <button
                type="button"
                className="sb-burger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={isOpen}
            >
                {isOpen ? "✕" : "☰"}
            </button>

            {/* Dim background behind the mobile drawer */}
            {isOpen && <div className="sb-backdrop" onClick={() => setIsOpen(false)} aria-hidden="true" />}

            <aside className="sb" data-open={isOpen} data-collapsed={collapsed}>
                <nav className="flex h-full flex-col" aria-label="Admin navigation">
                    {/* Logo + title */}
                    <div className="sb-brand group">
                        <Image
                            src="/access.jpg"
                            alt="Admin Logo"
                            width={40}
                            height={40}
                            className="sb-logo"
                        />
                        <h1 className="sb-title sb-label">Admin <span className="auth-highlight-text">Dashboard</span></h1>
                        <button
                            type="button"
                            className="sb-collapse"
                            onClick={() => setCollapsed(!collapsed)}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            title={collapsed ? "Expand" : "Collapse"}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu */}
                    <ul className="flex-1 space-y-1.5">
                        {NAV.map((item, i) => (
                            <li key={item.key} className="sb-slide" style={{ '--i': i }}>
                                <Link
                                    href={item.href}
                                    className="sb-item"
                                    data-active={active === item.key}
                                    aria-current={active === item.key ? "page" : undefined}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icon>{item.icon}</Icon>
                                    <span className="sb-label">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Footer actions */}
                    <div className="sb-footer">
                        <Link href="/admin/settings" className="sb-item sb-slide" style={{ '--i': 4 }} title="Settings">
                            <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></Icon>
                            <span className="sb-label">Settings</span>
                        </Link>
                        <Link href="/auth/admin" className="sb-item sb-item-danger sb-slide" style={{ '--i': 5 }} title="Log Out">
                            <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon>
                            <span className="sb-label">Log Out</span>
                        </Link>
                    </div>
                </nav>
            </aside>
        </>
    );
}