import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24 sm:pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <Link href="/" className="inline-block p-2 px-4 bg-white rounded-xl shadow-xs transition-opacity hover:opacity-90">
              <img
                src="/rankcity-logo.png"
                alt="RankCity - Discover Local Businesses"
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>
            <p className="mt-3 text-neutral-400 max-w-sm leading-relaxed text-xs">
              India&apos;s premier local business discovery search engine and verified rankings directory. Connecting customers with trusted regional hotels, restaurants, healthcare centers, and local services across Indian cities.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-[11px] leading-relaxed text-neutral-300">
              <strong className="text-amber-400 block mb-0.5">Sponsored Rankings Transparency:</strong>
              Sponsored placements displayed on RankCity are verified merchant positions competing through second-price auctions. Transparent disclosures ensure consumers always distinguish sponsored and organic recommendations.
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
              City Search
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/indore/hotels" className="hover:text-white transition-colors">
                  Hotels in Indore
                </Link>
              </li>
              <li>
                <Link href="/indore/restaurants" className="hover:text-white transition-colors">
                  Restaurants in Indore
                </Link>
              </li>
              <li>
                <Link href="/indore/healthcare" className="hover:text-white transition-colors">
                  Hospitals in Indore
                </Link>
              </li>
              <li>
                <Link href="/bengaluru/services" className="hover:text-white transition-colors">
                  Services in Bengaluru
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
              For Businesses
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/publisher/websites" className="hover:text-white transition-colors">
                  Add Your Business (Free)
                </Link>
              </li>
              <li>
                <Link href="/publisher/campaigns/new" className="hover:text-white transition-colors">
                  Promote Business
                </Link>
              </li>
              <li>
                <Link href="/publisher/wallet" className="hover:text-white transition-colors">
                  Merchant Wallet & UPI
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How Rankings Work
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase mb-3">
              Support & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Help & Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500">
            © {new Date().getFullYear()} RankCity Technologies India Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-neutral-500">
            <span>Verified Local Search Engine</span>
            <span>Made for Indian Cities</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
