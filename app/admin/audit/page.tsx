'use client';

import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/types';
import {
  Shield,
  Clock,
  History,
  Search,
  Filter,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/admin/audit');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.auditLogs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchesTarget = selectedTarget === 'all' || l.targetType === selectedTarget;
    const matchesQuery =
      !searchQuery ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.targetId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTarget && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          System & Administrative Audit Logs
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Immutable event ledger recording business verifications, campaign suspensions, auction parameter modifications, and financial actions.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action or operator name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:border-neutral-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-neutral-500 font-semibold">Target:</span>
          {['all', 'business', 'verification', 'campaign', 'review', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTarget(t)}
              className={`px-3 py-1.5 rounded-xl capitalize font-semibold transition-all cursor-pointer ${
                selectedTarget === t
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
            <History className="w-4 h-4 text-neutral-700" />
            <span>Immutable Audit Trail ({filtered.length})</span>
          </h3>
          <span className="text-xs text-neutral-400 font-medium">Server Timestamped</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-neutral-400">Loading audit records...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-400">No audit events match your search.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator / Persona</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action Key</th>
                  <th className="py-3 px-4">Target Type</th>
                  <th className="py-3 px-4">Target ID</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 text-neutral-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-900">{log.actorName}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{log.action}</td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-800 capitalize">
                      {log.targetType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-500">{log.targetId}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-neutral-600 font-mono text-[11px]">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
