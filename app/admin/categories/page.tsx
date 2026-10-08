'use client';

import React, { useState, useEffect } from 'react';
import { Category } from '@/types';
import { formatINR, paiseToRupees, rupeesToPaise } from '@/lib/currency';
import { Tag, Plus, Edit2, Check, ArrowRight } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minBidRupees, setMinBidRupees] = useState(10);
  const [incrementRupees, setIncrementRupees] = useState(1);
  const [commissionPercent, setCommissionPercent] = useState(15);
  const [subcategoriesStr, setSubcategoriesStr] = useState('General, Premium, Specialists');

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subs = subcategoriesStr.split(',').map((s) => s.trim()).filter(Boolean);
      await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          minBidPaise: rupeesToPaise(minBidRupees),
          bidIncrementPaise: rupeesToPaise(incrementRupees),
          commissionPercent,
          subcategories: subs,
        }),
      });
      setName('');
      setDescription('');
      setIsCreating(false);
      fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Auction Economics
          </span>
          <h1 className="text-2xl font-bold text-neutral-900">
            Category & Bid Configuration
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure minimum bids, increment steps, and platform commission rates.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? 'Cancel' : 'Add New Category'}</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateCategory} className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm space-y-4 max-w-xl">
          <h2 className="text-sm font-bold text-neutral-900">Create New Category Board</h2>
          <div>
            <label htmlFor="cat-create-name" className="block text-xs font-semibold text-neutral-700 mb-1">
              Category Name
            </label>
            <input
              id="cat-create-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Legal & Corporate Law"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="cat-create-desc" className="block text-xs font-semibold text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              id="cat-create-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Verified corporate lawyers and legal firms..."
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="cat-create-min-bid" className="block text-xs font-semibold text-neutral-700 mb-1">
                Min Bid (₹)
              </label>
              <input
                id="cat-create-min-bid"
                type="number"
                min="1"
                value={minBidRupees}
                onChange={(e) => setMinBidRupees(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label htmlFor="cat-create-increment" className="block text-xs font-semibold text-neutral-700 mb-1">
                Increment (₹)
              </label>
              <input
                id="cat-create-increment"
                type="number"
                min="1"
                value={incrementRupees}
                onChange={(e) => setIncrementRupees(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label htmlFor="cat-create-commission" className="block text-xs font-semibold text-neutral-700 mb-1">
                Commission (%)
              </label>
              <input
                id="cat-create-commission"
                type="number"
                min="0"
                max="50"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cat-create-subcats" className="block text-xs font-semibold text-neutral-700 mb-1">
              Subcategories (comma separated)
            </label>
            <input
              id="cat-create-subcats"
              type="text"
              value={subcategoriesStr}
              onChange={(e) => setSubcategoriesStr(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition-colors"
          >
            Create Category
          </button>
        </form>
      )}

      {/* Category List */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900">{cat.name}</h3>
                <span className="text-[11px] text-neutral-400 font-mono">/{cat.slug}</span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{cat.description}</p>
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-neutral-600">
                {cat.subcategories.map((s) => (
                  <span key={s.id} className="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs text-neutral-700 shrink-0">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Min Starting Bid</span>
                <strong className="text-neutral-900">{formatINR(cat.minBidPaise)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Min Increment</span>
                <strong className="text-neutral-900">{formatINR(cat.bidIncrementPaise)}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Platform Fee</span>
                <strong className="text-emerald-700">{cat.commissionPercent}%</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
