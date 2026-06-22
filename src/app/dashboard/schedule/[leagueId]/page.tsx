"use client";

/**
 * Full Schedule Page
 * Shows all completed and upcoming games for a specific league.
 * Organizes matchups by time range (past week, this week, next week)
 * with day-of-week grouping within each range.
 */

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getLeagueSchedule,
  ScheduleDayGroup,
  ScheduleMatchup,
  ScheduleTimeRange,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

/** Time range tabs for navigation */
const TIME_RANGES: { value: ScheduleTimeRange; label: string }[] = [
  { value: "pastWeek", label: "Past Week" },
  { value: "lastWeek", label: "Last Week" },
  { value: "thisWeek", label: "This Week" },
  { value: "nextWeek", label: "Next Week" },
];

export default function SchedulePage() {
  const params = useParams();
  const leagueId = params.leagueId as string;
  const { token } = useAuth();

  const [dayGroups, setDayGroups] = useState<ScheduleDayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<ScheduleTimeRange>("thisWeek");

  /** Fetch schedule for current time range */
  const fetchSchedule = useCallback(async () => {
    if (!token || !leagueId) return;

    setLoading(true);
    try {
      const data = await getLeagueSchedule(token, leagueId, timeRange, 1, 50);
      setDayGroups(data.matchups ?? []);
    } catch (error) {
      console.error("Failed to fetch full schedule:", error);
      setDayGroups([]);
    } finally {
      setLoading(false);
    }
  }, [token, leagueId, timeRange]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  /** Navigate to previous/next time range */
  const currentIdx = TIME_RANGES.findIndex((r) => r.value === timeRange);
  const canGoPrev = currentIdx > 0;
  const canGoNext = currentIdx < TIME_RANGES.length - 1;

  return (
    <div className="space-y-6">
      {/* ── Back Link ── */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* ── Page Header ── */}
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          Full Schedule
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          All completed and upcoming games
        </p>
      </div>

      {/* ── Time Range Selector ── */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canGoPrev}
          onClick={() => canGoPrev && setTimeRange(TIME_RANGES[currentIdx - 1].value)}
          className="h-9 w-9"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
                ${
                  timeRange === range.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          disabled={!canGoNext}
          onClick={() => canGoNext && setTimeRange(TIME_RANGES[currentIdx + 1].value)}
          className="h-9 w-9"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* ── Schedule Content ── */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : dayGroups.length === 0 ? (
        <div className="rounded-xl bg-gray-100 p-12 text-center">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            No games scheduled for{" "}
            {TIME_RANGES.find((r) => r.value === timeRange)?.label?.toLowerCase()}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {dayGroups.map((group) => (
            <DayGroupSection key={group.dayOfWeek} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

/** A group of games for a specific day of the week */
function DayGroupSection({ group }: { group: ScheduleDayGroup }) {
  const dayLabel =
    group.dayOfWeek.charAt(0).toUpperCase() +
    group.dayOfWeek.slice(1).toLowerCase();

  return (
    <div>
      <h3
        className="text-lg font-bold text-gray-800 uppercase tracking-wide mb-3"
        style={{ fontFamily: "var(--font-gamegrid-title)" }}
      >
        {dayLabel}
      </h3>

      <div className="space-y-3">
        {group.data.map((matchup) => (
          <ScheduleRow key={matchup.id} matchup={matchup} />
        ))}
      </div>
    </div>
  );
}

/** Single matchup row in the full schedule view */
function ScheduleRow({ matchup }: { matchup: ScheduleMatchup }) {
  const { teamA, teamB, game, matchTime, location } = matchup;
  const isCompleted = game?.status === "COMPLETED" || game?.status === "completed";
  const isLive = game?.isLive;

  // Format match date for display
  const matchDate = matchup.matchDateTime
    ? new Date(matchup.matchDateTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      {/* Team A */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <ScheduleTeamLogo url={teamA?.logoUrl} name={teamA?.name} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {teamA?.name ?? "TBD"}
          </p>
          <p className="text-xs text-gray-500">
            {teamA?.record ?? `${teamA?.wins ?? 0}-${teamA?.losses ?? 0}`}
          </p>
        </div>
      </div>

      {/* Score / Time */}
      <div className="flex flex-col items-center shrink-0 w-[100px]">
        {game ? (
          <>
            <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <span>{game.homeScore}</span>
              <span className="text-gray-300">-</span>
              <span>{game.awayScore}</span>
            </div>
            {isLive ? (
              <Badge variant="destructive" className="text-[10px] px-2 py-0">
                LIVE
              </Badge>
            ) : isCompleted ? (
              <span className="text-[11px] font-medium text-gray-500">
                Final
              </span>
            ) : null}
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-gray-700">
              {matchTime ?? "TBD"}
            </span>
            <span className="text-[11px] text-gray-400">{matchDate}</span>
          </>
        )}
      </div>

      {/* Team B */}
      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {teamB?.name ?? "TBD"}
          </p>
          <p className="text-xs text-gray-500">
            {teamB?.record ?? `${teamB?.wins ?? 0}-${teamB?.losses ?? 0}`}
          </p>
        </div>
        <ScheduleTeamLogo url={teamB?.logoUrl} name={teamB?.name} />
      </div>

      {/* Location badge (if available) */}
      {location && (
        <span className="hidden sm:block text-[11px] text-gray-400 shrink-0 max-w-[100px] truncate">
          {location}
        </span>
      )}

      {/* MANAGE button - matches dashboard game cards */}
      <Link
        href={`/dashboard/game/${game?.id ?? matchup.id}`}
        className="shrink-0 rounded-lg bg-[#0D5A1E] px-4 py-2 text-center text-sm font-bold uppercase tracking-wide text-white/90 hover:bg-[#0a4718] hover:text-white transition-colors"
        style={{ fontFamily: "var(--font-gamegrid-title)" }}
      >
        Manage
      </Link>
    </div>
  );
}

/** Team logo for schedule rows */
function ScheduleTeamLogo({ url, name }: { url?: string; name?: string }) {
  if (url) {
    return (
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white border border-gray-200 shrink-0">
        <Image
          src={url}
          alt={name ?? "Team"}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white shrink-0">
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
