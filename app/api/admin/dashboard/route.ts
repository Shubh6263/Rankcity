import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const stats = db.getAdminStats();
  const businesses = db.getBusinesses();
  const campaigns = db.campaigns;
  const categories = db.getCategories();
  const fraudAlerts = db.getFraudAlerts();
  const recentBids = db.bids.slice(0, 15);
  const transactions = db.transactions.slice(0, 15);

  return NextResponse.json({
    stats,
    pendingWebsites: businesses.filter((w) => w.status === 'pending'),
    pendingBusinesses: businesses.filter((w) => w.status === 'pending'),
    allWebsites: businesses,
    allBusinesses: businesses,
    activeCampaigns: campaigns.filter((c) => c.status === 'active'),
    categories,
    fraudAlerts,
    recentBids,
    recentTransactions: transactions,
    settings: db.settings,
  });
}
