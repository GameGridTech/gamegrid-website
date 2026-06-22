"use client";

/**
 * AlertsPanel
 * Right sidebar panel showing league-wide announcements.
 * Fetches announcements from every team in the selected league,
 * merges them, and displays sorted by newest first.
 * Includes a "CREATE ANNOUNCEMENT" button that opens the creation dialog.
 */

import { useEffect, useState, useCallback } from "react";
import { Megaphone, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import { getAnnouncements, Announcement } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CreateAnnouncementDialog from "./CreateAnnouncementDialog";

export default function AlertsPanel() {
  const { token } = useAuth();
  const { selectedLeague, leagueTeams, teamsLoading } = useDashboard();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  /** Fetch announcements from all teams in the league, merge and sort */
  const fetchAllAnnouncements = useCallback(async () => {
    if (!token || leagueTeams.length === 0) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch announcements for each team in parallel
      const results = await Promise.allSettled(
        leagueTeams.map((team) => getAnnouncements(token, team.id, 1, 5))
      );

      // Merge all successful results and deduplicate by id
      const all: Announcement[] = [];
      const seen = new Set<string>();

      for (const result of results) {
        if (result.status === "fulfilled") {
          for (const ann of result.value.data) {
            if (!seen.has(ann.id)) {
              seen.add(ann.id);
              all.push(ann);
            }
          }
        }
      }

      // Sort newest first
      all.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAnnouncements(all);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [token, leagueTeams]);

  // Refetch when teams load or league changes
  useEffect(() => {
    if (!teamsLoading) {
      fetchAllAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamsLoading, leagueTeams.length]);

  /** Refresh after a new announcement is created */
  const handleAnnouncementCreated = () => {
    fetchAllAnnouncements();
    setDialogOpen(false);
  };

  return (
    <div className="rounded-2xl bg-white overflow-hidden flex flex-col h-fit xl:sticky xl:top-[80px]">
      {/* ── Header ── */}
      <div className="px-5 py-4">
        <h2
          className="text-lg font-bold text-[#000000] uppercase tracking-wide"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          Alerts
        </h2>
      </div>

      {/* ── Announcements List ── */}
      <ScrollArea className="max-h-[400px] xl:max-h-[500px]">
        <div className="px-4 py-3 space-y-2">
          {loading || teamsLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))
          ) : announcements.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No announcements yet</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <AnnouncementRow key={ann.id} announcement={ann} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* ── Create Announcement Button ── */}
      <div className="px-4 py-4 border-t border-gray-100">
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full rounded-lg bg-[#000000] text-white font-bold uppercase tracking-wide hover:opacity-90"
        >
          <Megaphone className="w-4 h-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      {/* ── Create Announcement Dialog ── */}
      <CreateAnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleAnnouncementCreated}
      />
    </div>
  );
}

/** Single announcement row with team icon, description, and relative time */
function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  const teamName = announcement.team?.name ?? "Unknown";
  // Abbreviate team name: e.g., "CJML Basketball" -> "CJML BB"
  const shortName = abbreviateTeamName(teamName);

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EFEFEF]">
      {/* Team logo or icon */}
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
        {announcement.team?.logoUrl ? (
          <img
            src={announcement.team.logoUrl}
            alt={teamName}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <Megaphone className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#000000] line-clamp-2">
          <span className="font-bold">{shortName}: </span>
          {announcement.description}
        </p>
        <p className="text-[11px] text-[#717171] mt-0.5">
          {formatRelativeTime(announcement.createdAt)}
        </p>
      </div>
    </div>
  );
}

/** Abbreviate a league/team name for compact display */
function abbreviateTeamName(name: string): string {
  // If already short, return as-is
  if (name.length <= 12) return name;
  // Take first word + abbreviation of second
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1].slice(0, 2).toUpperCase()}`;
  }
  return name.slice(0, 12) + "...";
}

/** Format ISO date to relative time string (e.g., "2h ago", "3d ago") */
function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const date = new Date(isoDate).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
