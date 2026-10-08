'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { useAuth } from '@/lib/auth/context';
import { Business } from '@/types';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  ArrowRight,
  Shield,
  Check,
} from 'lucide-react';

interface ClaimPageProps {
  params: Promise<{ slug: string }>;
}

export default function ClaimBusinessPage({ params }: ClaimPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { currentUser } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [applicantName, setApplicantName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '+91 ');
  const [email, setEmail] = useState(currentUser.email || '');
  const [businessRole, setBusinessRole] = useState('Authorized Business Owner / Director');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadBiz() {
      try {
        const res = await fetch(`/api/businesses/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBusiness(data.business);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadBiz();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !applicantName || !phone) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: business.id,
          userId: currentUser.id,
          applicantName,
          phone,
          email,
          businessRole,
          registrationNumber,
          notes,
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500 text-xs">
        Loading claim verification...
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <RoleSwitcherBar />
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto px-4 py-20 text-center">
          <h1 className="text-xl font-bold">Business Not Found</h1>
          <Link href="/explore" className="text-xs text-blue-600 font-bold mt-2 block">
            Return to Explore
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
            <Building2 className="w-3.5 h-3.5" />
            <span>Official Ownership Verification Flow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Claim Management for {business.name}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600">
            Located at {business.address}, {business.city}. Confirm your administrative relationship to unlock sponsored ranking auctions, lead management, and official verified badges.
          </p>
        </div>

        {isSuccess ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-neutral-900">Ownership Claim Submitted</h2>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              Your claim for <strong>{business.name}</strong> has been assigned to the Moderator verification queue. You will receive an alert once your registration documents are approved.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/publisher"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Go to Business Portal
              </Link>
              <Link
                href={`/business/${business.slug}`}
                className="px-5 py-2.5 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold"
              >
                View Public Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-neutral-200 p-8 shadow-2xs space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Official Mobile (OTP & Alerts)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Official Business Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Executive Position / Role</label>
                  <input
                    type="text"
                    required
                    value={businessRole}
                    onChange={(e) => setBusinessRole(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  GSTIN / Municipal License / Registration Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 23AAAAA0000A1Z5 or IMC/TRADE/2026/91"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Additional Proof / Operating Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide utility bill details, company domain info, or branch manager confirmation..."
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Claim...' : 'Submit Claim & Request Verified Status'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
