'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Schema.org Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Contact & Support', url: '/contact' },
            ])
          ),
        }}
      />

      <RoleSwitcherBar />
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
              Customer & Partner Support
            </span>
            <h1 className="text-3xl font-extrabold text-neutral-950">Contact RankCity</h1>
            <p className="text-xs text-neutral-500 mt-1">
              Have questions regarding local business verification, GST invoices, or sponsored ranking auctions?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <Mail className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-xs font-bold text-neutral-900">Email Support</div>
              <div className="text-xs text-neutral-600">support@rankcity.in</div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <Phone className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="text-xs font-bold text-neutral-900">Helpline</div>
              <div className="text-xs text-neutral-600">+91 (0731) 405-8899</div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
              <MapPin className="w-5 h-5 text-rose-600 mb-2" />
              <div className="text-xs font-bold text-neutral-900">Headquarters</div>
              <div className="text-xs text-neutral-600">AB Road, Vijay Nagar, Indore, MP 452010</div>
            </div>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-900">Inquiry Received</h3>
              <p className="text-xs text-emerald-700">
                Our publisher success manager will get back to you within 2 business hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4 pt-4 border-t border-neutral-100"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-neutral-700 mb-1">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  placeholder="Describe your inquiry or website requirements..."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
