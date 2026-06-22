"use client";

/**
 * League History Page
 * Shows the authenticated admin's league participation history with summary
 * stats (total/active/completed leagues, overall record) and a per-league
 * breakdown (placement, sport, team record, dates).
 */

import { useCallback, useEffect, useState } from "react";
import {
  History as HistoryIcon,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getLeagueHistory,
  LeagueHistoryEntry,
  LeagueHistoryResponse,
} from "@/lib/api";
import PageHeader from "@/components/custom/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 10;

export default function LeagueHistoryPage() {
  const { token } = useAuth();

  const [data, setData] = useState<LeagueHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getLeagueHistory(token, page, PAGE_SIZE);
      setData(res);
    } catch (error) {
      console.error("Failed to load league history:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary;
  const entries = data?.leagueHistory ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="League History"
        subtitle="Every league you've participated in and how it went."
      />

      {/* ── Summary cards ── */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard label="Total leagues" value={summary.totalLeagues} />
          <SummaryCard label="Active" value={summary.activeLeagues} />
          <SummaryCard label="Completed" value={summary.completedLeagues} />
          <SummaryCard
            label="Win %"
            value={`${Math.round((summary.winPercentage ?? 0) * (summary.winPercentage > 1 ? 1 : 100))}%`}
          />
        </div>
      )}

      {/* ── History list ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <HistoryIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">No league history yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <HistoryRow key={entry.leagueId} entry={entry} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-[#EFEFEF] p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-[#717171]">
        {label}
      </p>
    </div>
  );
}

function HistoryRow({ entry }: { entry: LeagueHistoryEntry }) {
  const stats = entry.teamStats;
  const record = stats
    ? `${stats.wins}-${stats.losses}${stats.draws ? `-${stats.draws}` : ""}`
    : "—";

  const dateRange = formatDateRange(entry.startDate, entry.endDate);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0D5A1E]/5">
          <Trophy className="h-6 w-6 text-[#0D5A1E]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-bold text-gray-900">
              {entry.leagueName}
            </p>
            {entry.isCompleted ? (
              <Badge className="bg-gray-200 text-gray-700">Completed</Badge>
            ) : (
              <Badge className="bg-[#0D5A1E]/10 text-[#0D5A1E]">Active</Badge>
            )}
          </div>
          <p className="text-xs capitalize text-gray-500">
            {entry.sport}
            {stats?.teamName ? ` · ${stats.teamName}` : ""}
            {dateRange ? ` · ${dateRange}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 sm:gap-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Record
          </p>
          <p className="font-bold text-gray-900">{record}</p>
        </div>
        {entry.placement && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Placement
            </p>
            <p className="font-bold text-gray-900">{entry.placement}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Format a start/end date range, tolerating missing values */
function formatDateRange(start?: string, end?: string): string {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (start) return `Since ${fmt(start)}`;
  return "";
}
