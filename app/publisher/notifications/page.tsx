'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { formatINR } from '@/lib/currency';
import { NotificationItem, Campaign } from '@/types';
import { QuickBidModal } from '@/components/publisher/QuickBidModal';
import { WalletTopupModal } from '@/components/publisher/WalletTopupModal';
import { Bell, Zap, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PublisherNotificationsPage() {
  const router = useRouter();
  const { currentUser, notifications, markNotificationAsRead, refreshUserData } = useAuth();
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [targetCampaign, setTargetCampaign] = useState<(Campaign & {
    currentHighestBidPaise?: number;
    minNextBidPaise?: number;
  }) | null>(null);

  const handleQuickIncrease = async (notif: NotificationItem) => {
    await markNotificationAsRead(notif.id);
    if (notif.campaignId) {
      try {
        const res = await fetch(`/api/campaigns?publisherId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          const camp = data.campaigns?.find((c: Campaign) => c.id === notif.campaignId);
          if (camp) {
            setTargetCampaign(camp);
            setIsBidModalOpen(true);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Fallback: redirect to ranking page
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Live Dispatch
        </span>
        <h1 className="text-2xl font-bold text-neutral-900">
          Auction Alerts & Notifications
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Real-time outbid warnings and website verification status.
        </p>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-xs text-neutral-500">
            No notifications received yet.
          </div>
        ) : (
          notifications.map((notif) => {
            const isOutbid = notif.type === 'outbid';

            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.read
                    ? isOutbid
                      ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                      : 'bg-neutral-50 border-neutral-300 shadow-sm'
                    : 'bg-white border-neutral-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isOutbid
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isOutbid ? (
                      <AlertCircle className="w-5 h-5 text-amber-700" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 max-w-xl leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-neutral-400 block pt-0.5">
                      {new Date(notif.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isOutbid ? (
                    <button
                      onClick={() => handleQuickIncrease(notif)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-neutral-950" />
                      <span>
                        Increase Bid {notif.quickBidAmountPaise ? `→ ${formatINR(notif.quickBidAmountPaise)}` : ''}
                      </span>
                    </button>
                  ) : notif.actionUrl ? (
                    <Link
                      href={notif.actionUrl}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>

      <QuickBidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        campaign={targetCampaign}
        currentHighestBidPaise={targetCampaign?.currentHighestBidPaise || targetCampaign?.maxBidPaise || 1000}
        minNextBidPaise={targetCampaign?.minNextBidPaise || (targetCampaign?.maxBidPaise ? targetCampaign.maxBidPaise + 100 : 1100)}
        onBidSuccess={async () => {
          await refreshUserData();
        }}
        onOpenWallet={() => {
          setIsBidModalOpen(false);
          setIsWalletModalOpen(true);
        }}
      />

      <WalletTopupModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSuccess={async () => {
          await refreshUserData();
          setIsBidModalOpen(true);
        }}
      />
    </div>
  );
}
