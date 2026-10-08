'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { formatINR, rupeesToPaise } from '@/lib/currency';
import {
  X,
  QrCode,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Clock,
  ArrowRight,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface WalletTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function WalletTopupModal({ isOpen, onClose, onSuccess }: WalletTopupModalProps) {
  const { currentUser, refreshUserData } = useAuth();
  const [step, setStep] = useState<'SELECT_METHOD' | 'SUBMIT_UTR'>('SELECT_METHOD');
  const [payOption, setPayOption] = useState<'QR_SCAN' | 'ENTER_UPI'>('QR_SCAN');
  const [amountRupees, setAmountRupees] = useState<number | ''>(100);
  const [userUpiId, setUserUpiId] = useState(
    currentUser.email ? `${currentUser.email.split('@')[0]}@okaxis` : ''
  );
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numericAmount = typeof amountRupees === 'number' ? amountRupees : 0;
  const adminUpiId = process.env.NEXT_PUBLIC_UPI_ID || 'patreshubham141@okhdfcbank';
  const payeeName = process.env.NEXT_PUBLIC_PAYEE_NAME || 'Shubham Patre';

  const handleProceedToPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountRupees || numericAmount < 50) {
      setError('Minimum wallet recharge amount is ₹50.');
      return;
    }
    if (payOption === 'ENTER_UPI' && (!userUpiId.trim() || !userUpiId.includes('@'))) {
      setError('Please enter a valid UPI ID (e.g. mobile@upi ya name@okaxis)');
      return;
    }
    setError(null);
    setStep('SUBMIT_UTR');
  };

  const handleConfirmUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setError('Please enter a valid 12-digit UPI UTR / Transaction Reference number.');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Create payment request record
      const payRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amountPaise: rupeesToPaise(numericAmount),
          paymentMethod: 'UPI',
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.payment) {
        throw new Error(payData.error || 'Failed to create payment record');
      }

      // 2. Submit UTR for Admin Verification
      const submitRes = await fetch(`/api/payments/${payData.payment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: utrNumber.trim(),
        }),
      });

      const submitData = await submitRes.json();
      if (!submitRes.ok) {
        throw new Error(submitData.error || 'Failed to submit UTR');
      }

      setIsSuccess(true);
      await refreshUserData();
      setTimeout(() => {
        setIsSuccess(false);
        setStep('SELECT_METHOD');
        setUtrNumber('');
        if (onSuccess) onSuccess();
        onClose();
      }, 2500);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAdminUpi = () => {
    navigator.clipboard.writeText(adminUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(adminUpiId)}&pn=${encodeURIComponent(payeeName)}&am=${numericAmount.toFixed(2)}&cu=INR&mode=02&purpose=00`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiIntentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900 text-white flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real UPI Verification</span>
            </div>
            <h2 className="text-base font-bold">Add Money to Business Wallet</h2>
          </div>
          <button
            onClick={() => {
              setStep('SELECT_METHOD');
              setError(null);
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">UTR Submitted Successfully</h3>
            <p className="text-xs text-neutral-600 max-w-xs mx-auto">
              Aapki ₹{numericAmount.toLocaleString()} ki payment verification ke liye bhej di gayi hai. Admin UTR verify karte hi wallet me credit ho jayega.
            </p>
            <div className="p-3 bg-neutral-50 rounded-xl text-[11px] font-mono text-neutral-500 border border-neutral-200">
              UTR: {utrNumber}
            </div>
          </div>
        ) : step === 'SELECT_METHOD' ? (
          <form onSubmit={handleProceedToPay} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Amount Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="recharge-amount" className="text-xs font-semibold text-neutral-800">
                  Select Recharge Amount (₹)
                </label>
                <span className="text-[11px] font-medium text-neutral-500">Min ₹50</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmountRupees(amt)}
                    className={`py-2 px-1 text-xs font-mono font-semibold rounded-xl border transition-all cursor-pointer ${
                      amountRupees === amt
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400">
                  ₹
                </span>
                <input
                  id="recharge-amount"
                  type="number"
                  min="50"
                  step="10"
                  value={amountRupees === '' ? '' : amountRupees}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setAmountRupees('');
                    } else {
                      const num = parseInt(val, 10);
                      setAmountRupees(isNaN(num) ? '' : num);
                    }
                  }}
                  className="w-full pl-8 pr-4 py-2 bg-white border border-neutral-300 rounded-xl text-sm font-bold font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                  placeholder="Min ₹50"
                  required
                />
              </div>
            </div>

            {/* Payment Method 2 Options: QR Code Scan vs Enter UPI ID */}
            <div>
              <span className="block text-xs font-semibold text-neutral-800 mb-2">
                Payment Option Chunein:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPayOption('QR_SCAN')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                    payOption === 'QR_SCAN'
                      ? 'border-neutral-900 bg-neutral-50/80 text-neutral-900 ring-2 ring-neutral-900 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs">QR Code Scan Karein</span>
                  <span className="text-[10px] text-neutral-400 font-normal">GPay / PhonePe / Paytm</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayOption('ENTER_UPI')}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                    payOption === 'ENTER_UPI'
                      ? 'border-neutral-900 bg-neutral-50/80 text-neutral-900 ring-2 ring-neutral-900 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">Apna UPI ID Daalein</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Direct VPA Request</span>
                </button>
              </div>
            </div>

            {/* If Option 2: Enter UPI ID */}
            {payOption === 'ENTER_UPI' && (
              <div className="p-3 bg-neutral-50/70 rounded-2xl border border-neutral-200 space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label htmlFor="user-upi" className="block text-[11px] font-medium text-neutral-500">
                    Aapka UPI ID (VPA)
                  </label>
                  <span className="text-[10px] text-neutral-400">e.g. mobile@upi</span>
                </div>
                <input
                  id="user-upi"
                  type="text"
                  value={userUpiId}
                  onChange={(e) => setUserUpiId(e.target.value)}
                  placeholder="e.g. 9826012345@ybl ya name@okhdfcbank"
                  className="w-full px-3 py-2 text-xs bg-white text-neutral-700 placeholder:text-neutral-300 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 font-mono transition-colors"
                  required
                />
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!amountRupees || numericAmount < 50}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Aage Badhein</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: SHOW QR / UPI DETAILS AND TAKE UTR NUMBER */
          <form onSubmit={handleConfirmUtr} className="p-6 space-y-4 animate-in fade-in">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Recharge Amount
                </span>
                <span className="text-xl font-black text-neutral-950 font-mono">
                  ₹{numericAmount.toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep('SELECT_METHOD')}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline font-medium cursor-pointer"
              >
                Change Amount
              </button>
            </div>

            {/* Option 1 View: QR Code */}
            {payOption === 'QR_SCAN' ? (
              <div className="p-4 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center text-center space-y-3">
                <span className="text-xs font-bold text-neutral-800">
                  Kisi bhi UPI App se Scan Karein
                </span>
                <div className="p-2.5 bg-white border border-neutral-200 rounded-2xl shadow-xs">
                  {/* Real dynamic UPI QR code */}
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>
                <div className="w-full flex items-center justify-between bg-neutral-100 p-2 rounded-xl text-xs">
                  <span className="font-mono text-neutral-700 font-bold">{adminUpiId}</span>
                  <button
                    type="button"
                    onClick={copyAdminUpi}
                    className="px-2 py-0.5 bg-white hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-neutral-200"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <a
                  href={upiIntentUrl}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold block transition-colors"
                >
                  Pay via UPI App Directly
                </a>
              </div>
            ) : (
              /* Option 2 View: User UPI */
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-blue-950 block">UPI Collect / Direct Pay Details</span>
                <p className="text-blue-800 text-[11px]">
                  Aapne UPI ID di hai: <strong className="font-mono">{userUpiId}</strong>
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                  <span className="font-mono font-bold text-neutral-800">{adminUpiId}</span>
                  <button
                    type="button"
                    onClick={copyAdminUpi}
                    className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <a
                  href={upiIntentUrl}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold block text-center transition-colors mt-2"
                >
                  Open in UPI App to Pay
                </a>
              </div>
            )}

            {/* REAL MANDATORY UTR INPUT */}
            <div className="space-y-1 pt-1">
              <label htmlFor="utr-input" className="block text-xs font-bold text-neutral-800">
                12-Digit UTR / Transaction Reference Number *
              </label>
              <input
                id="utr-input"
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 429381029381"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                required
              />
              <span className="text-[10px] text-neutral-400 block">
                Payment karne ke baad Google Pay / PhonePe ki receipt me se 12-digit UTR daalein.
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep('SELECT_METHOD')}
                className="flex-1 py-2.5 px-4 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isProcessing || !utrNumber.trim()}
                className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isProcessing ? 'Verifying...' : 'Submit UTR for Verification'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

