'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { CheckCircle2, User, Building, Phone, Mail } from 'lucide-react';

export default function PublisherSettingsPage() {
  const { currentUser, refreshUserData } = useAuth();
  const [name, setName] = useState(currentUser.name);
  const [company, setCompany] = useState(currentUser.companyName || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setName(currentUser.name);
    setCompany(currentUser.companyName || '');
    setPhone(currentUser.phone || '');
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name,
          companyName: company,
          phone,
        }),
      });
      if (res.ok) {
        await refreshUserData();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Account Profile
        </span>
        <h1 className="text-2xl font-bold text-neutral-900">
          Publisher Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Manage your business contact details and notification channels.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-sm max-w-2xl">
        {saved && (
          <div className="p-3 mb-6 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label htmlFor="pub-name" className="block font-semibold text-neutral-700 mb-1">
              Primary Contact Name
            </label>
            <input
              id="pub-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="pub-company" className="block font-semibold text-neutral-700 mb-1">
              Registered Company / Clinic Name
            </label>
            <input
              id="pub-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="pub-email" className="block font-semibold text-neutral-700 mb-1">
              Email Address (Login ID)
            </label>
            <input
              id="pub-email"
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3 py-2 border border-neutral-200 bg-neutral-100 rounded-lg text-xs text-neutral-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="pub-phone" className="block font-semibold text-neutral-700 mb-1">
              Phone / WhatsApp for Outbid Alerts
            </label>
            <input
              id="pub-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98260 00000"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-bold text-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
