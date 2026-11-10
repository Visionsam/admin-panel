'use client';

import React, { useState, useMemo } from 'react';
import ThemeSwitcher from '../component/theme-toggle';
import Sidebar from '@/app/component/Sidebar';


// Comprehensive mock data tailored for Customer, Mechanic, and Admin roles
const INITIAL_USERS = [
  {
    id: 'USR-1001',
    name: 'Alexander Wright',
    email: 'alexander.w@apexmotors.com',
    password: 'password123#',
    phone: '+1 (555) 234-5678',
    role: 'Mechanic',
    shopName: 'Apex Motor Works',
    accountStatus: 'Active',
    verification: 'Approved',
    joinedDate: '2026-01-15',
  },
  {
    id: 'USR-1002',
    name: 'Sarah Jenkins',
    email: 'sarah.j@gmail.com',
    password: 'securePass@88',
    phone: '+1 (555) 345-6789',
    role: 'Lead',
    shopName: '—',
    accountStatus: 'Active',
    verification: 'Approved',
    joinedDate: '2026-02-04',
  },
  {
    id: 'USR-1003',
    name: 'sam',
    email: 'visionsam26@gmail.com',
    password: 'sam123',
    phone: '',
    role: 'Admin',
    shopName: '',
    accountStatus: 'Active',
    verification: '',
    joinedDate: '2025-11-20',
  }
];

export default function AdminUserManagement() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Form state for edit/add
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Lead',
    shopName: '',
    accountStatus: 'Active',
    verification: 'Pending',
  });

  // Toast feedback message
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Toggle visible password per row
  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter & Search Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search matching across Name, Email, or Phone
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query);

      // Role Filter (All / Customer / Mechanic / Admin)
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;

      // Account Status Filter (All / Active / Blocked)
      const matchesStatus = statusFilter === 'All' || user.accountStatus === statusFilter;

      // Verification Status Filter (All / Pending / Approved / Rejected)
      const matchesVerification =
        verificationFilter === 'All' || user.verification === verificationFilter;

      return matchesSearch && matchesRole && matchesStatus && matchesVerification;
    });
  }, [users, searchQuery, roleFilter, statusFilter, verificationFilter]);

  // Pagination calculation
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, safeCurrentPage, pageSize]);

  // Active filters count
  const activeFiltersCount =
    (roleFilter !== 'All' ? 1 : 0) +
    (statusFilter !== 'All' ? 1 : 0) +
    (verificationFilter !== 'All' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
    setVerificationFilter('All');
    setCurrentPage(1);
  };

  // Select all on current page
  const handleSelectAllOnPage = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedUsers.map((u) => u.id);
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = new Set(paginatedUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !pageIds.has(id)));
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllCurrentPageSelected =
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedUserIds.includes(u.id));

  // Edit User Handlers
  const handleOpenEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      role: user.role,
      shopName: user.shopName === '—' ? '' : user.shopName,
      accountStatus: user.accountStatus,
      verification: user.verification,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === formData.id
          ? {
            ...u,
            ...formData,
            shopName:
              formData.role === 'Lead'
                ? '—'
                : formData.shopName.trim() || '—',
          }
          : u
      )
    );
    setIsEditModalOpen(false);
    showToast(`User ${formData.name} updated successfully!`);
  };

  // Delete User Handlers
  const handleOpenDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!currentUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== currentUser.id));
    setSelectedUserIds((prev) => prev.filter((id) => id !== currentUser.id));
    setIsDeleteModalOpen(false);
    showToast(`User ${currentUser.name} has been removed.`, 'warning');
    setCurrentUser(null);
  };

  // Add User Handlers
  const handleOpenAddModal = () => {
    setFormData({
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      email: '',
      password: 'password123#',
      phone: '',
      role: 'Lead',
      shopName: '',
      accountStatus: 'Active',
      verification: 'Approved',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveNewUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    const newUser = {
      ...formData,
      shopName:
        formData.role === 'Lead'
          ? '—'
          : formData.shopName.trim() || '—',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsAddModalOpen(false);
    showToast(`New user "${newUser.name}" added successfully!`);
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedUserIds.length} selected users?`
      )
    ) {
      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      showToast(`Deleted ${selectedUserIds.length} users successfully.`, 'warning');
      setSelectedUserIds([]);
    }
  };

  const handleBulkStatusChange = (newStatus) => {
    setUsers((prev) =>
      prev.map((u) =>
        selectedUserIds.includes(u.id) ? { ...u, accountStatus: newStatus } : u
      )
    );
    showToast(
      `Updated ${selectedUserIds.length} users to ${newStatus}.`,
      'success'
    );
    setSelectedUserIds([]);
  };

  // Export to CSV
  // const handleExportCSV = () => {
  //   const headers = [
  //     'ID,Name,Email,Phone,Role,Shop Name,Account Status,Verification,Joined Date',
  //   ];
  //   const rows = filteredUsers.map(
  //     (u) =>
  //       `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.role}","${u.shopName}","${u.accountStatus}","${u.verification}","${u.joinedDate}"`
  //   );
  //   const csvContent =
  //     'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
  //   const encodedUri = encodeURI(csvContent);
  //   const link = document.createElement('a');
  //   link.setAttribute('href', encodedUri);
  //   link.setAttribute('download', `admin_users_${new Date().toISOString().slice(0, 10)}.csv`);
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   showToast('Exported users to CSV file!');
  // };

  // Quick toggle status in table
  const handleQuickToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, accountStatus: nextStatus } : u))
    );
    showToast(`User status changed to ${nextStatus}`);
  };

  // Copy email helper
  const handleCopy = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.accountStatus === 'Active').length;
    const pendingVerif = users.filter((u) => u.verification === 'Pending').length;
    const mechanics = users.filter((u) => u.role === 'Mechanic').length;
    return { total, active, pendingVerif, mechanics };
  }, [users]);

  // Avatar colors helper
  const getAvatarGradient = (role) => {
    switch (role) {
      case 'Admin':
        return 'from-purple-600 to-indigo-600 text-white';
      case 'Mechanic':
        return 'from-amber-500 to-orange-600 text-white';
      default:
        return 'from-emerald-500 to-teal-600 text-white';
    }
  };

  return (

    <div className="um-layout">
      <Sidebar active="users" />
      <main className="um-main">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all bg-[var(--bg-card)] border-slate-200 dark:border-slate-800">
          <span
            className={`w-2.5 h-2.5 rounded-full ${toast.type === 'warning'
              ? 'bg-amber-500'
              : toast.type === 'error'
                ? 'bg-rose-500'
                : 'bg-emerald-500'
              }`}
          />
          <span
            className="text-slate-800 dark:text-slate-200">{toast.message}</span>
        </div>

      )}
      {/* Main Container */}
      <div className="um-container">
        {/* Top Header */}
        <div className="um-card um-header">
          <div>
            <div className="flex  gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  User Management & <span className='auth-highlight-text'>Access Control</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage accounts, verify mechanic credentials, monitor statuses, and administer permissions.
                </p>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* <button
              onClick={handleExportCSV}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#1c2333] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-2xs cursor-pointer"
            >
              <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button> */}

            <button
              onClick={handleOpenAddModal}
              type="button"
              className="um-btn-primary inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add New User</span>
            </button>
           <div className="auth-toggle-slot ml-2 pr-2"><ThemeSwitcher /></div>
          </div>
        </div>
       
       
        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="um-card um-stat">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.total}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Across all roles</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div className="um-card um-stat">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Accounts</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.active}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {Math.round((metrics.active / (metrics.total || 1)) * 100)}% active rate
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="um-card um-stat">
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Verification</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.pendingVerif}</h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">Requires admin review</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="um-card um-stat">
            <div>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wider">Mechanics & Shops</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.mechanics}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Registered providers</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="um-card p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search Input: Name, Email, or Phone */}
            <div className="lg:col-span-5 relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, or phone..."
                className="um-input um-input-sm !pl-10 !pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter: Role (All / Customer / Mechanic / Admin) */}
            <div className="lg:col-span-2">
              <label className="um-label um-label-caps">
                Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="um-input um-input-sm cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Lead">Lead</option>
                <option value="Mechanic">Mechanic</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Filter: Account Status (All / Active / Blocked) */}
            <div className="lg:col-span-2">
              <label className="um-label um-label-caps">
                Account Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="um-input um-input-sm cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            {/* Filter: Verification (All / Pending / Approved / Rejected) */}
            <div className="lg:col-span-2">
              <label className="um-label um-label-caps">
                Verification
              </label>
              <select
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="um-input um-input-sm cursor-pointer"
              >
                <option value="All">All Verifications</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Reset Filters CTA */}
            <div className="lg:col-span-1 flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                disabled={activeFiltersCount === 0}
                title="Reset all filters"
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${activeFiltersCount > 0
                  ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 cursor-pointer'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Active Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">
                Found <strong className="text-slate-900 dark:text-white font-semibold">{totalUsers}</strong> {totalUsers === 1 ? 'user' : 'users'}
              </span>

              {roleFilter !== 'All' && (
                <span className="um-pill">
                  Role: {roleFilter}
                  <button onClick={() => setRoleFilter('All')} className="hover:text-rose-600">×</button>
                </span>
              )}

              {statusFilter !== 'All' && (
                <span className="um-pill">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('All')} className="hover:text-rose-600">×</button>
                </span>
              )}

              {verificationFilter !== 'All' && (
                <span className="um-pill">
                  Verification: {verificationFilter}
                  <button onClick={() => setVerificationFilter('All')} className="hover:text-rose-600">×</button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-rose-600">×</button>
                </span>
              )}
            </div>

            {/* Per-Page Selector (10 / 25 / 50) */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs">Show per page:</span>
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-[#1c2333] p-0.5">
                {[10, 25, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${pageSize === size
                      ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (when rows selected) */}
        {selectedUserIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs sm:text-sm animate-[auth-fade-in_0.25s_ease]">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                {selectedUserIds.length}
              </span>
              <span className="font-medium text-indigo-900 dark:text-indigo-200">
                user{selectedUserIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleBulkStatusChange('Active')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Mark Active
              </button>
              <button
                type="button"
                onClick={() => handleBulkStatusChange('Blocked')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Block Selected
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={() => setSelectedUserIds([])}
                className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:underline cursor-pointer"
              >
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* User Table Responsive Card */}
        <div className="um-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1150px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-[#1c2333] text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 pl-5 pr-2 w-10">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={handleSelectAllOnPage}
                      className="um-check"
                    />
                  </th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Email</th>
                  {/* <th className="py-3.5 px-4">Leads</th> */}
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Shop Name</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 pr-5 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => {
                    const isSelected = selectedUserIds.includes(user.id);
                    const isPasswordShown = !!visiblePasswords[user.id];

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/30' : ''
                          }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 pl-5 pr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectUser(user.id)}
                            className="um-check"
                          />
                        </td>

                        {/* User (Avatar + Name + ID) */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                                user.role
                              )} flex items-center justify-center font-bold text-xs uppercase tracking-wider shadow-2xs`}
                            >
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
                                {user.name}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                {user.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 group">
                            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[190px]">
                              {user.email}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(user.email, 'Email')}
                              title="Copy email"
                              className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* Password (Masked with toggle) */}  
                        {/* <td className="py-3.5 px-4">      
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-[#1c2333] border border-slate-200/70 dark:border-slate-700 rounded-lg font-mono text-xs">
                            <span className="text-slate-600 dark:text-slate-300 select-all">
                              {isPasswordShown ? user.password : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(user.id)}
                              title={isPasswordShown ? 'Hide password' : 'Show password'}
                              className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer p-0.5"
                            >
                              {isPasswordShown ? (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td> */}

                        {/* Phone */}
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {user.phone}
                        </td>

                        {/* Role (Customer / Mechanic / Admin) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {user.role === 'Admin' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              Admin
                            </span>
                          )}
                          {user.role === 'Mechanic' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Mechanic
                            </span>
                          )}
                          {user.role === 'Lead' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Lead
                            </span>
                          )}
                        </td>

                        {/* Shop Name */}
                        <td className="py-3.5 px-4">
                          {user.shopName && user.shopName !== '—' ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                              <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="truncate max-w-[180px]">{user.shopName}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-light">—</span>
                          )}
                        </td>

                        {/* Account Status (Active / Blocked) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleQuickToggleStatus(user.id, user.accountStatus)}
                            title="Click to toggle status"
                            className="cursor-pointer group inline-flex"
                          >
                            {user.accountStatus === 'Active' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Blocked
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Verification (Pending / Approved / Rejected) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {user.verification === 'Approved' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                              </svg>
                              Approved
                            </span>
                          )}
                          {user.verification === 'Pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <svg className="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
                              </svg>
                              Pending
                            </span>
                          )}
                          {user.verification === 'Rejected' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              <svg className="w-3 h-3 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Rejected
                            </span>
                          )}
                        </td>

                        {/* Actions (Edit / Delete) */}
                        <td className="py-3.5 pr-5 pl-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Action */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(user)}
                              title="Edit user details"
                              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            {/* Delete Action */}
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(user)}
                              title="Delete user"
                              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-slate-700 dark:text-slate-200 font-semibold text-base">No users matched your criteria</div>
                        <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm">
                          Try modifying your search term or adjusting role, status, or verification filters.
                        </p>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-slate-50/60 dark:bg-[#1c2333]/60 border-t border-[var(--bg-card-border)] text-xs text-slate-600 dark:text-slate-400 transition-colors">
            <div>
              Showing{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                {totalUsers === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                {Math.min(safeCurrentPage * pageSize, totalUsers)}
              </strong>{' '}
              of <strong className="text-slate-900 dark:text-slate-100 font-semibold">{totalUsers}</strong> users
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c2333] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-[#1c2333] cursor-pointer font-medium transition-all"
              >
                Previous
              </button>

              {/* Page Number Pills */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first, last, and pages close to safeCurrentPage
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - safeCurrentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    const prev = array[index - 1];
                    const showEllipsis = prev && page - prev > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-slate-400 dark:text-slate-500">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${safeCurrentPage === page
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-[#1c2333] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safeCurrentPage >= totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c2333] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-[#1c2333] cursor-pointer font-medium transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="um-overlay">
          <div className="um-modal">
            <div className="um-modal-head">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Edit User Account</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">ID: {formData.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="um-close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="um-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="um-input"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="um-input"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="um-input"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="um-input cursor-pointer"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="um-label">
                    Shop Name {formData.role === 'Mechanic' && <span className="text-amber-600 dark:text-amber-400">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled={formData.role === 'Customer'}
                    placeholder={formData.role === 'Customer' ? 'Not applicable for Customer' : 'e.g. Apex Auto Tech'}
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="um-input disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Password (Admin Reset)
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="um-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Account Status
                  </label>
                  <select
                    value={formData.accountStatus}
                    onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                    className="um-input cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="um-label">
                    Verification Status
                  </label>
                  <select
                    value={formData.verification}
                    onChange={(e) => setFormData({ ...formData, verification: e.target.value })}
                    className="um-input cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="um-modal-foot">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="um-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="um-btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {isAddModalOpen && (
        <div className="um-overlay">
          <div className="um-modal">
            <div className="um-modal-head">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Create New User</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Add a Customer, Mechanic, or Admin</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="um-close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveNewUser} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="um-label">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Taylor"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="um-input"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. liam@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="um-input"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +1 (555) 789-0123"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="um-input"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="um-input cursor-pointer"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Mechanic">Mechanic</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="um-label">
                    Shop Name {formData.role === 'Mechanic' && <span className="text-amber-600 dark:text-amber-400">*</span>}
                  </label>
                  <input
                    type="text"
                    disabled={formData.role === 'Customer'}
                    placeholder={formData.role === 'Customer' ? 'Not applicable for Customer' : 'e.g. Turbo Speed Works'}
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="um-input disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-400 dark:disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="um-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="um-label">
                    Account Status
                  </label>
                  <select
                    value={formData.accountStatus}
                    onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
                    className="um-input cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div>
                  <label className="um-label">
                    Verification
                  </label>
                  <select
                    value={formData.verification}
                    onChange={(e) => setFormData({ ...formData, verification: e.target.value })}
                    className="um-input cursor-pointer"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="um-modal-foot">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="um-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="um-btn-primary"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {isDeleteModalOpen && currentUser && (
        <div className="um-overlay">
          <div className="bg-[var(--bg-card)] rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 text-center transition-colors">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Confirm User Deletion</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong> ({currentUser.email})?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs shadow-rose-200 dark:shadow-none transition-all cursor-pointer"
              >
                Yes, Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}