'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { User, UserRole } from '@/types';
import {
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  Building2,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { allUsers, currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FINANCE_ADMIN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'MODERATOR':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'BUSINESS_OWNER':
      case 'PUBLISHER':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'BUSINESS_MANAGER':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'CUSTOMER':
      case 'USER':
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const filtered = allUsers.filter((u) => {
    const matchesRole =
      selectedRole === 'all' ||
      u.role === selectedRole ||
      (selectedRole === 'CUSTOMER' && (u.role === 'CUSTOMER' || u.role === 'USER')) ||
      (selectedRole === 'BUSINESS_OWNER' && (u.role === 'BUSINESS_OWNER' || u.role === 'PUBLISHER'));
    const matchesQuery =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesQuery;
  });

  const roles = [
    { key: 'all', label: 'All Users' },
    { key: 'CUSTOMER', label: 'Customers' },
    { key: 'BUSINESS_OWNER', label: 'Business Owners' },
    { key: 'BUSINESS_MANAGER', label: 'Business Managers' },
    { key: 'MODERATOR', label: 'Moderators' },
    { key: 'FINANCE_ADMIN', label: 'Finance Admins' },
    { key: 'ADMIN', label: 'Admins' },
    { key: 'SUPER_ADMIN', label: 'Super Admins' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Users & RBAC Roles Directory
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Full Role-Based Access Control matrix under PRD Section 4 & 15. Manage authorization tiers across customer, enterprise, and operations roles.
        </p>
      </div>

      {/* Role Breakdown Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Business Owners
          </span>
          <span className="text-xl font-black text-neutral-900">
            {allUsers.filter((u) => u.role === 'BUSINESS_OWNER' || u.role === 'PUBLISHER').length}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Business Managers
          </span>
          <span className="text-xl font-black text-neutral-900">
            {allUsers.filter((u) => u.role === 'BUSINESS_MANAGER').length}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Moderators & Finance
          </span>
          <span className="text-xl font-black text-neutral-900">
            {allUsers.filter((u) => u.role === 'MODERATOR' || u.role === 'FINANCE_ADMIN').length}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Root Admins
          </span>
          <span className="text-xl font-black text-neutral-900">
            {allUsers.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
          </span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, email, or org..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-neutral-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {roles.map((r) => (
            <button
              key={r.key}
              onClick={() => setSelectedRole(r.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedRole === r.key
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Registered Personas ({filtered.length})</span>
          </h3>
          <span className="text-xs text-neutral-400 font-medium">Authoritative RBAC Table</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">RBAC Role</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Company / Organization</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-neutral-900">{u.name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-neutral-600">{u.email}</td>
                  <td className="py-3.5 px-4 text-neutral-600">{u.phone || '—'}</td>
                  <td className="py-3.5 px-4 text-neutral-700 font-medium">{u.companyName || 'Individual Customer'}</td>
                  <td className="py-3.5 px-4 text-neutral-400">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
