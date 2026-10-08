'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { BusinessTeamMember, Business } from '@/types';
import {
  Users,
  UserCheck,
  Shield,
  UserPlus,
  Trash2,
  CheckCircle2,
  X,
  Building2,
  Check,
} from 'lucide-react';

export default function BusinessTeamPage() {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [teamMembers, setTeamMembers] = useState<BusinessTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedBizId, setSelectedBizId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'BUSINESS_OWNER' | 'BUSINESS_MANAGER'>('BUSINESS_MANAGER');
  const [permissions, setPermissions] = useState<string[]>([
    'manage_profile',
    'manage_leads',
    'view_analytics',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const allAvailablePermissions = [
    { key: 'manage_profile', label: 'Edit Profile & Media' },
    { key: 'manage_campaigns', label: 'Create & Bid on Campaigns' },
    { key: 'manage_leads', label: 'View & Respond to Leads' },
    { key: 'view_analytics', label: 'View Conversion Analytics' },
    { key: 'manage_billing', label: 'Wallet & Invoices Access' },
  ];

  const loadData = async () => {
    try {
      const [bizRes, teamRes] = await Promise.all([
        fetch(`/api/businesses?ownerId=${currentUser.id}`),
        fetch('/api/team'),
      ]);

      if (bizRes.ok) {
        const bData = await bizRes.json();
        setBusinesses(bData.businesses || []);
        if (bData.businesses?.length > 0) {
          setSelectedBizId(bData.businesses[0].id);
        }
      }

      if (teamRes.ok) {
        const tData = await teamRes.json();
        setTeamMembers(tData.teamMembers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const togglePermission = (key: string) => {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId || !name || !email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBizId,
          name: name.trim(),
          email: email.trim(),
          role,
          permissions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTeamMembers((prev) => [...prev, data.member]);
        setShowInviteModal(false);
        setName('');
        setEmail('');
        setFeedback('Team member added with assigned RBAC permissions!');
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/team/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Team & Delegation (RBAC)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Delegate campaign management, lead tracking, and profile updates to your business managers with granular access control.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Role Delegation Explainer Card */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Multi-Manager Delegation Security</span>
        </div>
        <p className="text-xs text-blue-950/80 leading-relaxed max-w-2xl">
          Under PRD Section 4 & 15, <strong>BUSINESS_MANAGER</strong> roles can manage customer enquiries, adjust auction bids within authorized budget caps, and update business media without accessing the owner's master withdrawal credentials.
        </p>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Active Team Members ({teamMembers.length})</span>
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-neutral-400">Loading team roster...</div>
        ) : teamMembers.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">No delegated team members yet.</div>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-neutral-900">{member.name}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        member.role === 'BUSINESS_OWNER'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {member.role === 'BUSINESS_OWNER' ? 'Owner' : 'Manager'}
                    </span>
                    <span className="text-xs text-neutral-400">· {member.businessName}</span>
                  </div>

                  <div className="text-xs text-neutral-600">{member.email}</div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-[10px] bg-white border border-neutral-200 px-2 py-0.5 rounded-md text-neutral-600"
                      >
                        {perm.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {member.role !== 'BUSINESS_OWNER' && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer self-end sm:self-auto"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-neutral-900">Add Business Manager / Teammate</h3>
            <p className="text-xs text-neutral-500">
              Assign permissions to collaborate on listing updates and auction bidding.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">Target Business</label>
                <select
                  aria-label="Target Business"
                  value={selectedBizId}
                  onChange={(e) => setSelectedBizId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:border-blue-600"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Member Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@domain.com"
                    className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700">Assign Permissions</label>
                <div className="space-y-1.5">
                  {allAvailablePermissions.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2.5 text-xs text-neutral-700 p-2 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50"
                    >
                      <input
                        type="checkbox"
                        checked={permissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="rounded text-blue-600"
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name || !email}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
