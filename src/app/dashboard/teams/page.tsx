"use client";

/**
 * Teams & Rosters Page
 * Lists every team in the selected league with summary stats, and lets admins
 * create new teams and edit existing ones (name, abbreviation, jersey color,
 * logo). A compact league roster panel links through to member management.
 *
 * Team data comes from DashboardContext (leagueTeams + refreshTeams).
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Pencil,
  Users,
  Crown,
  Upload,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import {
  createTeam,
  updateTeam,
  getLeagueRosters,
  LeagueTeam,
  LeagueRosterMember,
  ApiError,
} from "@/lib/api";
import PageHeader from "@/components/custom/dashboard/PageHeader";
import NoLeagueState from "@/components/custom/dashboard/NoLeagueState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function TeamsPage() {
  const { token } = useAuth();
  const {
    leagues,
    leaguesLoading,
    selectedLeague,
    leagueTeams,
    teamsLoading,
    refreshTeams,
  } = useDashboard();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<LeagueTeam | null>(null);

  // League roster (members + team assignment) for the panel below the grid.
  const [roster, setRoster] = useState<LeagueRosterMember[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    if (!token || !selectedLeague) return;
    let cancelled = false;
    setRosterLoading(true);

    getLeagueRosters(token, selectedLeague.id, 1, 8)
      .then((res) => {
        if (!cancelled) setRoster(res.roster ?? []);
      })
      .catch(() => {
        if (!cancelled) setRoster([]);
      })
      .finally(() => {
        if (!cancelled) setRosterLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, selectedLeague]);

  if (!leaguesLoading && leagues.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Teams & Rosters" />
        <NoLeagueState hasNoLeagues />
      </div>
    );
  }

  if (!selectedLeague) {
    return (
      <div className="space-y-6">
        <PageHeader title="Teams & Rosters" />
        <NoLeagueState />
      </div>
    );
  }

  const teamCount = leagueTeams.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams & Rosters"
        subtitle={selectedLeague.name}
        actions={
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            <Plus className="h-4 w-4" />
            Add Team
          </Button>
        }
      />

      {/* ── Summary ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Teams" value={teamsLoading ? "—" : String(teamCount)} />
        <StatCard
          label="Players rostered"
          value={
            teamsLoading
              ? "—"
              : String(
                  leagueTeams.reduce((sum, t) => sum + (t.playerCount ?? 0), 0)
                )
          }
        />
        <StatCard
          label="Teams with captain"
          value={
            teamsLoading
              ? "—"
              : String(leagueTeams.filter((t) => t.captain).length)
          }
        />
      </div>

      {/* ── Teams grid ── */}
      {teamsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : leagueTeams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-14 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="mb-4 text-sm text-gray-500">
            No teams in this league yet.
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            <Plus className="h-4 w-4" />
            Add your first team
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagueTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={() => setEditTeam(team)}
            />
          ))}
        </div>
      )}

      {/* ── League roster panel ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">League Roster</h2>
          <Link
            href="/dashboard/members"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0D5A1E] hover:underline"
          >
            Manage members
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {rosterLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : roster.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">
            No members in this league yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {roster.map((m) => (
              <li
                key={m.userId}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                    {(m.firstName?.[0] ?? m.email[0]).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="truncate text-xs text-gray-500">{m.email}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-500">
                  {m.team?.name ?? "Free agent"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Create dialog ── */}
      <TeamFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        leagueId={selectedLeague.id}
        onSaved={refreshTeams}
      />

      {/* ── Edit dialog ── */}
      <TeamFormDialog
        open={!!editTeam}
        onOpenChange={(open) => !open && setEditTeam(null)}
        leagueId={selectedLeague.id}
        team={editTeam ?? undefined}
        onSaved={refreshTeams}
      />
    </div>
  );
}

/** Small summary metric card */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#EFEFEF] p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-[#717171]">
        {label}
      </p>
    </div>
  );
}

/** A team card showing logo, record, captain and an edit action */
function TeamCard({
  team,
  onEdit,
}: {
  team: LeagueTeam;
  onEdit: () => void;
}) {
  const record = team.matchRecord
    ? `${team.matchRecord.wins}-${team.matchRecord.losses}`
    : "0-0";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <TeamLogo
          url={team.logoUrl}
          name={team.name}
          color={team.jerseyColor}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-gray-900">{team.name}</p>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {team.abbreviation || "—"}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-gray-600">
          <Users className="h-4 w-4 text-gray-400" />
          {team.playerCount ?? 0} players
        </span>
        <span className="font-semibold text-gray-900">{record}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Crown className="h-3.5 w-3.5 text-amber-400" />
        {team.captain
          ? `${team.captain.firstName} ${team.captain.lastName}`
          : "No captain assigned"}
      </div>
    </div>
  );
}

/** Team logo with jersey-color fallback */
function TeamLogo({
  url,
  name,
  color,
}: {
  url?: string;
  name: string;
  color?: string | null;
}) {
  if (url) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
        <Image src={url} alt={name} fill className="object-cover" sizes="48px" />
      </div>
    );
  }
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: color || "#9ca3af" }}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

// ============================================
// Create / Edit dialog
// ============================================

function TeamFormDialog({
  open,
  onOpenChange,
  leagueId,
  team,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leagueId: string;
  team?: LeagueTeam;
  onSaved: () => Promise<void>;
}) {
  const { token } = useAuth();
  const isEdit = !!team;

  const [teamName, setTeamName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [jerseyColor, setJerseyColor] = useState("#0D5A1E");
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Re-seed the form whenever the dialog opens (or the target team changes).
  useEffect(() => {
    if (open) {
      setTeamName(team?.name ?? "");
      setAbbreviation(team?.abbreviation ?? "");
      setJerseyColor(team?.jerseyColor || "#0D5A1E");
      setLogo(null);
    }
  }, [open, team]);

  const handleSubmit = async () => {
    if (!token) return;
    if (teamName.trim().length < 2) {
      toast.error("Team name must be at least 2 characters.");
      return;
    }
    if (abbreviation.trim().length < 1) {
      toast.error("Please enter a team abbreviation.");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && team) {
        await updateTeam(
          token,
          leagueId,
          team.id,
          {
            teamName: teamName.trim(),
            abbreviation: abbreviation.trim().toUpperCase(),
            jerseyColor,
          },
          logo ?? undefined
        );
        toast.success("Team updated.");
      } else {
        await createTeam(
          token,
          leagueId,
          {
            teamName: teamName.trim(),
            abbreviation: abbreviation.trim().toUpperCase(),
            jerseyColor,
          },
          logo ?? undefined
        );
        toast.success("Team created.");
      }
      onOpenChange(false);
      await onSaved();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? (error.data as { message?: string | string[] })?.message
          : undefined;
      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to save team."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit team" : "Add team"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this team's details."
              : "Create a new team in this league."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Lakers"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="abbr">Abbreviation</Label>
              <Input
                id="abbr"
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value)}
                placeholder="e.g. LAL"
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Jersey color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="color"
                  type="color"
                  value={jerseyColor}
                  onChange={(e) => setJerseyColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-gray-300 bg-white"
                />
                <Input
                  value={jerseyColor}
                  onChange={(e) => setJerseyColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="team-logo"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              {logo ? "Change logo" : "Upload logo (optional)"}
            </Label>
            <input
              id="team-logo"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
            {logo && <p className="text-xs text-gray-600">{logo.name}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create team"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
