"use client";

/**
 * League Settings Page
 * Manage the currently selected league across four tabs:
 *  - General:      core configuration (name, teams, players, scoring, etc.)
 *  - Branding:     league logo upload
 *  - Game Settings: sport-specific scoring / stat tracking / period config
 *  - Danger Zone:  permanently delete the league
 *
 * Operates on the selected league from DashboardContext.
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Save, Trash2, Upload, ImageIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import {
  getLeagueDetail,
  updateLeagueByAdmin,
  updateLeagueLogo,
  deleteLeague,
  getGameSettings,
  getGameSettingsDefaults,
  updateGameSettings,
  LeagueDetail,
  GameSettings,
  GameSettingsDefaults,
  UpdateLeagueByAdminPayload,
  ScoringSystem,
  MatchFrequency,
  SCORING_OPTIONS,
  FREQUENCY_OPTIONS,
  SPORT_OPTIONS,
  ApiError,
} from "@/lib/api";
import PageHeader from "@/components/custom/dashboard/PageHeader";
import NoLeagueState from "@/components/custom/dashboard/NoLeagueState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function LeagueSettingsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { leagues, leaguesLoading, selectedLeague, refreshLeagues, selectLeague } =
    useDashboard();

  const [detail, setDetail] = useState<LeagueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  /** Load the full league detail when the selected league changes */
  const loadDetail = useCallback(async () => {
    if (!token || !selectedLeague) return;
    setLoading(true);
    try {
      const data = await getLeagueDetail(token, selectedLeague.id);
      setDetail(data);
    } catch (error) {
      console.error("Failed to load league detail:", error);
      toast.error("Failed to load league settings.");
    } finally {
      setLoading(false);
    }
  }, [token, selectedLeague]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  if (!leaguesLoading && leagues.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="League Settings" />
        <NoLeagueState hasNoLeagues />
      </div>
    );
  }

  if (!selectedLeague) {
    return (
      <div className="space-y-6">
        <PageHeader title="League Settings" />
        <NoLeagueState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="League Settings"
        subtitle={selectedLeague.name}
      />

      {loading || !detail ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0f5a1f]" />
        </div>
      ) : (
        <Tabs defaultValue="general" className="gap-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="game">Game Settings</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralTab
              detail={detail}
              leagueId={selectedLeague.id}
              onSaved={loadDetail}
            />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingTab
              detail={detail}
              leagueId={selectedLeague.id}
              onSaved={loadDetail}
            />
          </TabsContent>

          <TabsContent value="game">
            <GameSettingsTab leagueId={selectedLeague.id} />
          </TabsContent>

          <TabsContent value="danger">
            <DangerZoneTab
              leagueName={selectedLeague.name}
              leagueId={selectedLeague.id}
              onDeleted={async () => {
                const fresh = await refreshLeagues();
                if (fresh.length > 0) {
                  selectLeague(fresh[0]);
                  router.push("/dashboard");
                } else {
                  router.push("/dashboard");
                }
              }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

/** Reusable settings card wrapper */
function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {description && <p className="mb-4 text-sm text-gray-500">{description}</p>}
      <div className={description ? "" : "mt-4"}>{children}</div>
    </div>
  );
}

// ============================================
// General tab
// ============================================

function GeneralTab({
  detail,
  leagueId,
  onSaved,
}: {
  detail: LeagueDetail;
  leagueId: string;
  onSaved: () => Promise<void>;
}) {
  const { token } = useAuth();
  const { refreshLeagues } = useDashboard();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    leagueName: detail.leagueName ?? "",
    maxTeams: detail.maxTeams ?? 8,
    minPlayersPerTeam: detail.minPlayersPerTeam ?? 5,
    enableSubstitutes: detail.enableSubstitutes ?? false,
    matchDuration: detail.matchDuration ?? 40,
    matchFrequency: (detail.matchFrequency ?? "weekly") as MatchFrequency,
    scoringSystem: (detail.scoringSystem ?? "w3-d1-l0") as ScoringSystem,
    customWin: detail.customScoringSystem?.pointsForWin ?? 3,
    customDraw: detail.customScoringSystem?.pointsForDraw ?? 1,
    customLoss: detail.customScoringSystem?.pointsForLoss ?? 0,
    enableTieBreakers: detail.enableTieBreakers ?? false,
  });

  const sportLabel =
    SPORT_OPTIONS.find((s) => s.value === detail.sport)?.label ??
    detail.sport ??
    "—";

  const update = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    if (!token) return;
    if (form.leagueName.trim().length < 2) {
      toast.error("League name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    const payload: UpdateLeagueByAdminPayload = {
      leagueName: form.leagueName.trim(),
      maxTeams: form.maxTeams,
      minPlayersPerTeam: form.minPlayersPerTeam,
      enableSubstitutes: form.enableSubstitutes,
      matchDuration: form.matchDuration,
      matchFrequency: form.matchFrequency,
      scoringSystem: form.scoringSystem,
      enableTieBreakers: form.enableTieBreakers,
      customScoringSystem:
        form.scoringSystem === "custom"
          ? {
              pointsForWin: form.customWin,
              pointsForDraw: form.customDraw,
              pointsForLoss: form.customLoss,
            }
          : undefined,
    };

    try {
      await updateLeagueByAdmin(token, leagueId, payload);
      toast.success("League settings saved.");
      await Promise.all([onSaved(), refreshLeagues()]);
    } catch (error) {
      toast.error(extractError(error, "Failed to save settings."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsCard
      title="General"
      description="Core configuration for your league."
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">League name</Label>
            <Input
              id="name"
              value={form.leagueName}
              onChange={(e) => update({ leagueName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Sport</Label>
            <Input value={sportLabel} disabled />
            <p className="text-xs text-gray-400">
              Sport can&apos;t be changed after a league is created.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Maximum teams"
            value={form.maxTeams}
            min={2}
            max={64}
            onChange={(v) => update({ maxTeams: v })}
          />
          <NumberField
            label="Minimum players per team"
            value={form.minPlayersPerTeam}
            min={1}
            max={50}
            onChange={(v) => update({ minPlayersPerTeam: v })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Match frequency</Label>
            <Select
              value={form.matchFrequency}
              onValueChange={(v) => update({ matchFrequency: v as MatchFrequency })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <NumberField
            label="Match duration (minutes)"
            value={form.matchDuration}
            min={1}
            max={240}
            onChange={(v) => update({ matchDuration: v })}
          />
        </div>

        <div className="space-y-2">
          <Label>Scoring system</Label>
          <Select
            value={form.scoringSystem}
            onValueChange={(v) => update({ scoringSystem: v as ScoringSystem })}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCORING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.scoringSystem === "custom" && (
          <div className="grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
            <NumberField
              label="Points for win"
              value={form.customWin}
              min={0}
              max={10}
              onChange={(v) => update({ customWin: v })}
            />
            <NumberField
              label="Points for draw"
              value={form.customDraw}
              min={0}
              max={10}
              onChange={(v) => update({ customDraw: v })}
            />
            <NumberField
              label="Points for loss"
              value={form.customLoss}
              min={0}
              max={10}
              onChange={(v) => update({ customLoss: v })}
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Tie-breakers</p>
            <p className="text-xs text-gray-500">
              Apply tie-breaker rules when teams are level on points.
            </p>
          </div>
          <Switch
            checked={form.enableTieBreakers}
            onCheckedChange={(v) => update({ enableTieBreakers: v })}
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save changes
              </>
            )}
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// Branding tab
// ============================================

function BrandingTab({
  detail,
  leagueId,
  onSaved,
}: {
  detail: LeagueDetail;
  leagueId: string;
  onSaved: () => Promise<void>;
}) {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFile = (selected: File | null) => {
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!token || !file) return;
    setSaving(true);
    try {
      await updateLeagueLogo(token, leagueId, file);
      toast.success("League logo updated.");
      setFile(null);
      setPreview(null);
      await onSaved();
    } catch (error) {
      toast.error(extractError(error, "Failed to upload logo."));
    } finally {
      setSaving(false);
    }
  };

  const currentLogo = preview ?? detail.leagueLogo ?? null;

  return (
    <SettingsCard
      title="Branding"
      description="Upload a logo used for your league's branding inside the app."
    >
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          {currentLogo ? (
            <Image
              src={currentLogo}
              alt="League logo"
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <ImageIcon className="h-10 w-10 text-gray-300" />
          )}
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="logo-upload"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Choose image
          </Label>
          <input
            id="logo-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-gray-400">PNG, JPG or WebP up to 5MB.</p>
          {file && (
            <p className="text-xs text-gray-600">Selected: {file.name}</p>
          )}

          <div>
            <Button
              onClick={handleUpload}
              disabled={!file || saving}
              className="bg-[#0D5A1E] hover:bg-[#0a4718]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload logo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================
// Game Settings tab
// ============================================

function GameSettingsTab({ leagueId }: { leagueId: string }) {
  const { token } = useAuth();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [meta, setMeta] = useState<GameSettingsDefaults | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const [current, defaults] = await Promise.all([
          getGameSettings(token, leagueId).catch(() => null),
          getGameSettingsDefaults(token, leagueId).catch(() => null),
        ]);
        if (cancelled) return;
        setMeta(defaults);
        // Seed from current settings, falling back to sport defaults.
        setSettings(current ?? defaults?.defaults ?? {});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token, leagueId]);

  /** Toggle a boolean field within a settings group */
  const toggle = (
    group: "scoringFormat" | "statsTracking" | "advancedOptions",
    key: string,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      [group]: { ...(prev?.[group] ?? {}), [key]: value },
    }));
  };

  const handleSave = async () => {
    if (!token || !settings) return;
    setSaving(true);
    try {
      await updateGameSettings(token, leagueId, {
        scoringFormat: settings.scoringFormat,
        statsTracking: settings.statsTracking,
        advancedOptions: settings.advancedOptions,
        periodFormat: settings.periodFormat,
      });
      toast.success("Game settings saved.");
    } catch (error) {
      toast.error(extractError(error, "Failed to save game settings."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingsCard title="Game Settings">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[#0f5a1f]" />
        </div>
      </SettingsCard>
    );
  }

  if (!settings) {
    return (
      <SettingsCard title="Game Settings">
        <p className="text-sm text-gray-500">
          Game settings are not available for this league.
        </p>
      </SettingsCard>
    );
  }

  const scoringKeys = Object.keys(settings.scoringFormat ?? {});
  const statsKeys = Object.keys(settings.statsTracking ?? {});
  const advancedKeys = Object.keys(settings.advancedOptions ?? {});

  return (
    <SettingsCard
      title="Game Settings"
      description={`Sport-specific scoring and stat tracking${
        meta?.settingsInfo?.displayName
          ? ` for ${meta.settingsInfo.displayName}`
          : ""
      }.`}
    >
      <div className="space-y-8">
        {scoringKeys.length > 0 && (
          <ToggleGroup
            title="Scoring format"
            keys={scoringKeys}
            values={settings.scoringFormat ?? {}}
            onToggle={(k, v) => toggle("scoringFormat", k, v)}
          />
        )}

        {statsKeys.length > 0 && (
          <ToggleGroup
            title="Stat tracking"
            keys={statsKeys}
            values={settings.statsTracking ?? {}}
            onToggle={(k, v) => toggle("statsTracking", k, v)}
          />
        )}

        {advancedKeys.length > 0 && (
          <ToggleGroup
            title="Advanced options"
            keys={advancedKeys}
            values={settings.advancedOptions ?? {}}
            onToggle={(k, v) => toggle("advancedOptions", k, v)}
          />
        )}

        {settings.periodFormat && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Period format
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Structure</Label>
                <Input
                  value={settings.periodFormat.structure ?? ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      periodFormat: {
                        ...prev?.periodFormat,
                        structure: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. halves, quarters"
                />
              </div>
              <NumberField
                label="Period length (minutes)"
                value={settings.periodFormat.periodLength ?? 0}
                min={1}
                max={60}
                onChange={(v) =>
                  setSettings((prev) => ({
                    ...prev,
                    periodFormat: { ...prev?.periodFormat, periodLength: v },
                  }))
                }
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save game settings
              </>
            )}
          </Button>
        </div>
      </div>
    </SettingsCard>
  );
}

/** A labeled group of boolean toggles derived from a settings object */
function ToggleGroup({
  title,
  keys,
  values,
  onToggle,
}: {
  title: string;
  keys: string[];
  values: Record<string, boolean>;
  onToggle: (key: string, value: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700">
        {title}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {keys.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3"
          >
            <span className="text-sm font-medium text-gray-800">
              {humanizeKey(key)}
            </span>
            <Switch
              checked={!!values[key]}
              onCheckedChange={(v) => onToggle(key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Danger Zone tab
// ============================================

function DangerZoneTab({
  leagueName,
  leagueId,
  onDeleted,
}: {
  leagueName: string;
  leagueId: string;
  onDeleted: () => Promise<void>;
}) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!token) return;
    setDeleting(true);
    try {
      await deleteLeague(token, leagueId);
      toast.success(`"${leagueName}" deleted.`);
      setOpen(false);
      await onDeleted();
    } catch (error) {
      toast.error(extractError(error, "Failed to delete league."));
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6">
      <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
      <p className="mb-4 text-sm text-red-600/80">
        Permanently delete this league and all of its teams, schedules, stats,
        and memberships. This action cannot be undone.
      </p>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />
        Delete league
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{leagueName}&rdquo;?</DialogTitle>
            <DialogDescription>
              This permanently removes the league and everything in it. Type the
              league name below to confirm.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={leagueName}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== leagueName || deleting}
              onClick={handleDelete}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" /> Delete permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Convert a camelCase settings key to a human-readable label */
function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/\b(\d)pt\b/gi, "$1PT")
    .trim();
}

/** Extract a friendly message from an ApiError (or fall back) */
function extractError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const message = (error.data as { message?: string | string[] })?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }
  return fallback;
}
