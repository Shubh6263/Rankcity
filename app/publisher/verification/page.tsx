'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Business, BusinessVerification } from '@/types';
import {
  ShieldCheck,
  FileCheck,
  Upload,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  FileText,
} from 'lucide-react';

export default function BusinessVerificationPage() {
  const { currentUser } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [verifications, setVerifications] = useState<BusinessVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [selectedBizId, setSelectedBizId] = useState('');
  const [documentType, setDocumentType] = useState<BusinessVerification['documentType']>('gst_certificate');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [bizRes, verifRes] = await Promise.all([
        fetch(`/api/businesses?ownerId=${currentUser.id}`),
        fetch('/api/verification'),
      ]);

      if (bizRes.ok) {
        const bData = await bizRes.json();
        setBusinesses(bData.businesses || []);
        if (bData.businesses?.length > 0) {
          setSelectedBizId(bData.businesses[0].id);
        }
      }

      if (verifRes.ok) {
        const vData = await verifRes.json();
        setVerifications(vData.verifications || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBizId || !documentNumber) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBizId,
          submittedBy: currentUser.id,
          submitterName: currentUser.name,
          documentType,
          documentNumber: documentNumber.trim(),
          documentUrl: documentUrl.trim() || 'https://docs.rankcity.in/verif/uploaded_doc.pdf',
          notes: notes.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVerifications((prev) => [data.verification, ...prev]);
        setDocumentNumber('');
        setDocumentUrl('');
        setNotes('');
        setSuccessMessage('Verification documents submitted successfully! Admin review in progress.');
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeBiz = businesses.find((b) => b.id === selectedBizId);
  const myVerifications = verifications.filter((v) =>
    businesses.some((b) => b.id === v.businessId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Business Verification & Trust Badges
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Verify your business legal registration to earn the Green Verified Partner badge, unlock higher organic relevance, and build consumer trust.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Verification Overview Banner */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PRD Trust & Credibility Standard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            {activeBiz?.isVerified ? 'Your Business is Officially Verified' : 'Submit Documents for Verification'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Verified listings receive 2.4x more customer calls and priority review placement. Submit your GST, Trade License, or municipal registration below.
          </p>
        </div>

        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shrink-0 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
            Status For Active Profile
          </span>
          <span
            className={`text-base font-extrabold mt-1 block ${
              activeBiz?.isVerified ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {activeBiz?.isVerified ? '✓ Verified Partner' : 'Pending Verification'}
          </span>
        </div>
      </div>

      {/* Two Column Layout: Submission Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Upload Verification Evidence</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Select Business Profile</label>
              <select
                aria-label="Select Business Profile"
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:border-blue-600"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city}) — {b.isVerified ? 'Verified' : 'Unverified'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Document Type</label>
                <select
                  aria-label="Document Type"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as any)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 bg-white focus:outline-hidden focus:border-blue-600"
                >
                  <option value="gst_certificate">GST Registration Certificate (Recommended)</option>
                  <option value="trade_license">Municipal Trade License</option>
                  <option value="pan_card">Business Entity PAN Card</option>
                  <option value="incorporation_cert">Certificate of Incorporation</option>
                  <option value="utility_bill">Commercial Electricity / Utility Bill</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700">Document / Registration ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 23AAAAA0000A1Z5 or IMC/TRADE/2026/89"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Document URL / Proof Link</label>
              <input
                type="url"
                placeholder="https://drive.google.com/... or uploaded document link"
                value={documentUrl}
                onChange={(e) => setDocumentUrl(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700">Additional Remarks / Notes for Admin</label>
              <textarea
                rows={3}
                placeholder="Details of operating partner, branch address verification, or tourism accreditation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !documentNumber}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting Documents...' : 'Submit For Official Verification'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Submission History */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            <span>Verification Submissions</span>
          </h3>

          {myVerifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No verification submissions logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myVerifications.map((v) => (
                <div key={v.id} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-neutral-900">{v.documentType.toUpperCase()}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        v.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-600">ID: {v.documentNumber}</div>

                  {v.notes && <p className="text-[11px] text-neutral-500 italic">"{v.notes}"</p>}

                  <div className="text-[10px] text-neutral-400">
                    Submitted on{' '}
                    {new Date(v.submittedAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
