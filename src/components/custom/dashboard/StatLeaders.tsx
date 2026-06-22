"use client";

/**
 * StatLeaders
 * Displays per-category stat leaders split into "Offensive Leaders" and
 * "Defensive Leaders" columns. Fetches the top-players endpoint (which now
 * includes per-category season totals) and, for each category, surfaces the
 * player with the highest value in that specific stat — not the PPR ranking.
 * A time-range dropdown (All-time / Today / This Week) scopes the dataset;
 * the per-category leader logic is unchanged across ranges.
 *
 * NOTE: Categories are basketball-specific (PTS/AST/3P/REB/BLK/STL). For other
 * sports the corresponding fields are absent, so leaders fall back gracefully.
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import { getTopPlayers, TopPlayer, TopPlayersTimeRange } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Selectable time windows for the stat-leaders dataset */
const TIME_RANGE_OPTIONS: { value: TopPlayersTimeRange; label: string }[] = [
  { value: "alltime", label: "All-time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
];

/** Numeric per-category fields on TopPlayer usable for ranking */
type StatField = "points" | "assists" | "threePointersMade" | "rebounds" | "blocks" | "steals";

/** Stat category definition for display, bound to its backing data field */
interface StatCategory {
  label: string;
  abbreviation: string;
  field: StatField;
}

/** Offensive stat categories shown on the left column */
const OFFENSIVE_CATEGORIES: StatCategory[] = [
  { label: "Points", abbreviation: "PTS", field: "points" },
  { label: "Assists", abbreviation: "AST", field: "assists" },
  { label: "3-Pointers", abbreviation: "3P", field: "threePointersMade" },
];

/** Defensive stat categories shown on the right column */
const DEFENSIVE_CATEGORIES: StatCategory[] = [
  { label: "Rebounds", abbreviation: "REB", field: "rebounds" },
  { label: "Blocks", abbreviation: "BLK", field: "blocks" },
  { label: "Steals", abbreviation: "STL", field: "steals" },
];

/** A category paired with its computed leader (player + that stat's value) */
interface CategoryLeader {
  category: StatCategory;
  player: TopPlayer | null;
  value: number;
}

/**
 * Returns the player with the highest value for the given stat field.
 * Ties resolve to the earlier player (the list arrives PPR-ranked, so the
 * higher-rated player wins a tie). Missing values are treated as 0; a leader
 * is still returned (possibly with value 0) as long as any players exist.
 */
function findLeader(
  players: TopPlayer[],
  category: StatCategory
): CategoryLeader {
  let best: TopPlayer | null = null;
  let bestValue = -Infinity;

  for (const player of players) {
    const value = player[category.field] ?? 0;
    if (value > bestValue) {
      best = player;
      bestValue = value;
    }
  }

  return { category, player: best, value: best ? bestValue : 0 };
}

export default function StatLeaders() {
  const { token } = useAuth();
  const { selectedLeague } = useDashboard();

  const [players, setPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  // Default to all-time season totals; user can narrow to today/this week.
  const [timeRange, setTimeRange] = useState<TopPlayersTimeRange>("alltime");

  // Refetch top players whenever the league or selected time range changes
  useEffect(() => {
    if (!token || !selectedLeague) return;

    let cancelled = false;
    setLoading(true);

    const fetchPlayers = async () => {
      try {
        const data = await getTopPlayers(token, selectedLeague.id, timeRange);
        if (!cancelled) setPlayers(data.players ?? []);
      } catch (error) {
        console.error("Failed to fetch top players:", error);
        if (!cancelled) setPlayers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlayers();
    return () => {
      cancelled = true;
    };
  }, [token, selectedLeague, timeRange]);

  // Derive the true leader for each category from the fetched players.
  // Memoized so we only re-rank when the player list changes.
  const offensiveLeaders = useMemo(
    () => OFFENSIVE_CATEGORIES.map((cat) => findLeader(players, cat)),
    [players]
  );
  const defensiveLeaders = useMemo(
    () => DEFENSIVE_CATEGORIES.map((cat) => findLeader(players, cat)),
    [players]
  );

  return (
    <section className="rounded-2xl bg-[#EFEFEF] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2
          className="text-xl font-bold text-[#000000] uppercase tracking-wide"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          Stat Leaders
        </h2>

        {/* Time-range filter — changing it refetches the underlying dataset */}
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TopPlayersTimeRange)}
        >
          <SelectTrigger
            size="sm"
            className="w-[130px] bg-white text-[#000000]"
            aria-label="Filter stat leaders by time range"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((col) => (
            <div key={col} className="space-y-4">
              {[1, 2, 3].map((row) => (
                <Skeleton key={row} className="h-16 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Offensive Leaders ── */}
          <div>
            <h3
              className="text-sm font-bold text-[#000000] uppercase tracking-wider mb-3"
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              Offensive Leaders
            </h3>
            <div className="space-y-1">
              {offensiveLeaders.map((leader, idx) => (
                <CategoryRow
                  key={leader.category.abbreviation}
                  category={leader.category}
                  player={leader.player}
                  value={leader.value}
                  showTopBorder={idx > 0}
                />
              ))}
            </div>
          </div>

          {/* ── Defensive Leaders ── */}
          <div>
            <h3
              className="text-sm font-bold text-[#000000] uppercase tracking-wider mb-3"
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              Defensive Leaders
            </h3>
            <div className="space-y-1">
              {defensiveLeaders.map((leader, idx) => (
                <CategoryRow
                  key={leader.category.abbreviation}
                  category={leader.category}
                  player={leader.player}
                  value={leader.value}
                  showTopBorder={idx > 0}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** Single stat category row showing the category header and its leader */
function CategoryRow({
  category,
  player,
  value,
  showTopBorder,
}: {
  category: StatCategory;
  player: TopPlayer | null;
  value: number;
  showTopBorder: boolean;
}) {
  return (
    <div>
      {showTopBorder && <Separator className="my-2" />}

      {/* Category header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#000000] uppercase tracking-wider">
          {category.label}
        </span>
        <span className="text-xs font-bold text-[#000000] uppercase">
          {category.abbreviation}
        </span>
      </div>

      {/* Player row - name in green #28A745 per design */}
      {player ? (
        <div className="flex items-center gap-3 py-1">
          {/* Player avatar */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#717171] shrink-0">
            {player.playerPicture ? (
              <Image
                src={player.playerPicture}
                alt={player.name}
                fill
                className="object-cover"
                sizes="36px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold bg-[#717171]">
                {player.name[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Name - vibrant dark green #0D5A1E per design palette */}
          <span className="text-sm font-semibold text-[#0D5A1E] uppercase flex-1 truncate">
            {player.name}
          </span>

          {/* Leader's value for this specific category (not PPR) */}
          <span className="text-sm font-bold text-[#000000]">
            {value}
          </span>
        </div>
      ) : (
        <p className="text-xs text-[#717171] italic py-2">No data available</p>
      )}
    </div>
  );
}
