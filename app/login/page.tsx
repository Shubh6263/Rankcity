'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { allUsers, switchUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      switchUser(found.id);
      router.push(found.role === 'ADMIN' ? '/admin' : '/publisher');
    } else {
      // Default to publisher
      switchUser('user_pub_1');
      router.push('/publisher');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl border border-neutral-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Marketplace Access
            </span>
            <h1 className="text-2xl font-extrabold text-neutral-950">Publisher Login</h1>
            <p className="text-xs text-neutral-500">
              Sign in to manage your website campaigns, live bids, and wallet.
            </p>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Quick Demo Persona Shortcuts */}
          <div className="pt-4 border-t border-neutral-100">
            <span className="block text-center text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              One-Click Demo Personas
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  switchUser('user_pub_2');
                  router.push('/publisher');
                }}
                className="w-full p-2.5 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-left flex items-center justify-between transition-colors text-xs cursor-pointer"
              >
                <div>
                  <strong className="text-neutral-900 block">Vikram Malhotra</strong>
                  <span className="text-[11px] text-neutral-500">Business Owner: The Grand Palace Hotel (Rank #1)</span>
                </div>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUser('user_pub_1');
                  router.push('/publisher');
                }}
                className="w-full p-2.5 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-left flex items-center justify-between transition-colors text-xs cursor-pointer"
              >
                <div>
                  <strong className="text-neutral-900 block">Dr. Amit Sharma</strong>
                  <span className="text-[11px] text-neutral-500">Business Owner: Sharma Spine & Physio Clinic</span>
                </div>
                <UserCheck className="w-4 h-4 text-sky-600" />
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUser('user_admin');
                  router.push('/admin');
                }}
                className="w-full p-2.5 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-left flex items-center justify-between transition-colors text-xs cursor-pointer"
              >
                <div>
                  <strong className="text-neutral-900 block">Rajesh Agrawal (Admin)</strong>
                  <span className="text-[11px] text-neutral-500">Admin Console, GMV & Anti-Fraud Control</span>
                </div>
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
