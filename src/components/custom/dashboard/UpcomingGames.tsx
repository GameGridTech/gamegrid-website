"use client";

/**
 * UpcomingGames
 * Displays a horizontally scrollable row of upcoming game cards for the selected league.
 * Includes a "VIEW SCHEDULE" button linking to the full schedule page.
 * Fetches data from the league-schedule endpoint with timeRange=thisWeek.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import { getLeagueSchedule, ScheduleMatchup } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import GameCard from "./GameCard";

export default function UpcomingGames() {
  const { token } = useAuth();
  const { selectedLeague } = useDashboard();

  const [matchups, setMatchups] = useState<ScheduleMatchup[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch upcoming schedule when league changes
  useEffect(() => {
    if (!token || !selectedLeague) return;

    let cancelled = false;
    setLoading(true);

    const fetchSchedule = async () => {
      try {
        const data = await getLeagueSchedule(
          token,
          selectedLeague.id,
          "thisWeek",
          1,
          20
        );
        if (!cancelled) {
          // Flatten day groups into a single matchup list
          const allMatchups = data.matchups.flatMap((group) => group.data);
          setMatchups(allMatchups);
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
        if (!cancelled) setMatchups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSchedule();
    return () => {
      cancelled = true;
    };
  }, [token, selectedLeague]);

  return (
    <section>
      {/* ── Section header: title left, compact "View Schedule" link right ── */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          className="text-xl font-bold text-[#000000] uppercase tracking-wide"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          Upcoming Games
        </h2>

        {/* Smaller footprint than before, but same destination/behavior */}
        <Button
          asChild
          size="sm"
          className="shrink-0 rounded-full bg-[#000000] font-bold uppercase tracking-wide text-white hover:bg-[#000000]/90"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          <Link href={`/dashboard/schedule/${selectedLeague?.id ?? ""}`}>
            View Schedule
          </Link>
        </Button>
      </div>

      {/* ── Game Cards Row - each card is its own gray bubble ── */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-[260px] h-[100px] rounded-xl shrink-0" />
          ))}
        </div>
      ) : matchups.length === 0 ? (
        <div className="rounded-xl bg-[#EFEFEF] p-8 text-center">
          <CalendarDays className="w-8 h-8 text-[#717171] mx-auto mb-2" />
          <p className="text-sm text-[#717171]">No upcoming games this week</p>
        </div>
      ) : (
        <div className="relative -mx-1 px-1">
          {/* Scrollable row */}
          <div className="flex gap-4 overflow-x-auto pb-2 scroll-smooth">
            {matchups.map((m) => (
              <GameCard key={m.id} matchup={m} />
            ))}
          </div>
          {/* Right fade - haze so content doesn't look cut off */}
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-2 z-10 w-12 bg-gradient-to-l from-white to-transparent"
            aria-hidden
          />
        </div>
      )}
    </section>
  );
}
