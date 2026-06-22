"use client";

/**
 * Create League Wizard
 * Multi-step guided flow for an admin to create a new league. Each step maps
 * to a slice of the backend CreateLeaguePayload. On submit the league is
 * created, the sidebar league list is refreshed, the new league is selected,
 * and the admin lands on the League Settings page.
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import {
  createLeague,
  CreateLeaguePayload,
  SportType,
  ScoringSystem,
  MatchFrequency,
  PlayOffFormat,
  SPORT_OPTIONS,
  SCORING_OPTIONS,
  FREQUENCY_OPTIONS,
  PLAYOFF_FORMAT_OPTIONS,
  ApiError,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/** All wizard form state in one object */
interface LeagueForm {
  leagueName: string;
  sport: SportType;
  rosterFormat: "manual" | "auto";
  maxTeams: number;
  minPlayersPerTeam: number;
  enableSubstitutes: boolean;
  maxSubstitutesPerTeam: number;
  matchFrequency: MatchFrequency;
  matchDuration: number;
  scoringSystem: ScoringSystem;
  customWin: number;
  customDraw: number;
  customLoss: number;
  enableTieBreakers: boolean;
  enablePlayOffs: boolean;
  playOffFormat: PlayOffFormat;
  numberOfTeamsInPlayoffs: number;
}

const INITIAL_FORM: LeagueForm = {
  leagueName: "",
  sport: "basketball",
  rosterFormat: "manual",
  maxTeams: 8,
  minPlayersPerTeam: 5,
  enableSubstitutes: false,
  maxSubstitutesPerTeam: 3,
  matchFrequency: "weekly",
  matchDuration: 40,
  scoringSystem: "w3-d1-l0",
  customWin: 3,
  customDraw: 1,
  customLoss: 0,
  enableTieBreakers: true,
  enablePlayOffs: true,
  playOffFormat: "single-elimination",
  numberOfTeamsInPlayoffs: 4,
};

const STEPS = [
  { id: 1, title: "Basics" },
  { id: 2, title: "Teams & Players" },
  { id: 3, title: "Match Rules" },
  { id: 4, title: "Standings & Playoffs" },
  { id: 5, title: "Review" },
] as const;

export default function CreateLeaguePage() {
  const router = useRouter();
  const { token } = useAuth();
  const { refreshLeagues, selectLeague } = useDashboard();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<LeagueForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  /** Patch a subset of the form */
  const update = (patch: Partial<LeagueForm>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  /** Per-step validation gating the Next button */
  const stepValid = useMemo(() => {
    switch (step) {
      case 1:
        return form.leagueName.trim().length >= 2;
      case 2:
        return form.maxTeams >= 2 && form.minPlayersPerTeam >= 1;
      case 3:
        return form.matchDuration > 0;
      default:
        return true;
    }
  }, [step, form]);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  /** Build the API payload from form state */
  const buildPayload = (): CreateLeaguePayload => ({
    leagueName: form.leagueName.trim(),
    sport: form.sport,
    competitionFormat: {
      format: "standard",
      customFormat:
        form.rosterFormat === "manual"
          ? "manual rosters"
          : "auto-generated rosters",
    },
    numberOfTeamsAndPlayers: {
      maxTeams: form.maxTeams,
      minPlayersPerTeam: form.minPlayersPerTeam,
      enableSubstitutes: form.enableSubstitutes,
      maxSubstitutesPerTeam: form.enableSubstitutes
        ? form.maxSubstitutesPerTeam
        : undefined,
    },
    matchRules: {
      matchFrequency: form.matchFrequency,
      matchDuration: form.matchDuration,
      scoringSystem: form.scoringSystem,
      customScoringSystem:
        form.scoringSystem === "custom"
          ? {
              pointsForWin: form.customWin,
              pointsForDraw: form.customDraw,
              pointsForLoss: form.customLoss,
            }
          : undefined,
      enableTieBreakers: form.enableTieBreakers,
      enablePlayOffs: form.enablePlayOffs,
      playOffFormat: form.enablePlayOffs ? form.playOffFormat : undefined,
      numberOfTeamsInPlayoffs: form.enablePlayOffs
        ? form.numberOfTeamsInPlayoffs
        : undefined,
    },
    rosterType: form.rosterFormat,
  });

  /** Submit the league to the API */
  const handleSubmit = async () => {
    if (!token) {
      toast.error("You must be signed in to create a league.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await createLeague(token, buildPayload());
      const newId = response.savedLeague?.id;

      toast.success(`"${form.leagueName.trim()}" created successfully.`);

      // Refresh the sidebar list and select the new league.
      const fresh = await refreshLeagues();
      const match = fresh.find((l) => l.id === newId);
      if (match) selectLeague(match);

      router.push("/dashboard/settings");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? (error.data as { message?: string })?.message ||
            "Failed to create league."
          : "Something went wrong creating the league.";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">
      {/* ── Back link ── */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* ── Header ── */}
      <div>
        <h1
          className="text-2xl font-bold uppercase tracking-wide text-gray-900 sm:text-3xl"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          Create a League
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your league. Everything here syncs instantly to the
          GameGrid app your players use.
        </p>
      </div>

      {/* ── Step indicator ── */}
      <Stepper current={step} />

      {/* ── Step content ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {step === 1 && <StepBasics form={form} update={update} />}
        {step === 2 && <StepTeams form={form} update={update} />}
        {step === 3 && <StepMatchRules form={form} update={update} />}
        {step === 4 && <StepPlayoffs form={form} update={update} />}
        {step === 5 && <StepReview form={form} />}
      </div>

      {/* ── Footer nav ── */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goBack}
          disabled={step === 1 || submitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {step < STEPS.length ? (
          <Button
            onClick={goNext}
            disabled={!stepValid}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                Create League
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Horizontal step progress indicator */
function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, idx) => {
        const isDone = s.id < current;
        const isActive = s.id === current;
        return (
          <div key={s.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-[#0D5A1E] text-white"
                    : isDone
                      ? "bg-[#0D5A1E]/20 text-[#0D5A1E]"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span
                className={`hidden text-[11px] font-medium sm:block ${
                  isActive ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {s.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 rounded ${
                  isDone ? "bg-[#0D5A1E]/40" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Step components
// ============================================

interface StepProps {
  form: LeagueForm;
  update: (patch: Partial<LeagueForm>) => void;
}

/** Section heading for each step */
function StepHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function StepBasics({ form, update }: StepProps) {
  return (
    <div>
      <StepHeading
        title="League basics"
        subtitle="Name your league, pick a sport, and choose how rosters are built."
      />
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="leagueName">League name</Label>
          <Input
            id="leagueName"
            value={form.leagueName}
            onChange={(e) => update({ leagueName: e.target.value })}
            placeholder="e.g. Summer City Basketball League"
            maxLength={80}
          />
        </div>

        <div className="space-y-2">
          <Label>Sport</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SPORT_OPTIONS.map((opt) => {
              const active = form.sport === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ sport: opt.value })}
                  className={`rounded-xl border p-3 text-sm font-semibold transition-colors ${
                    active
                      ? "border-[#0D5A1E] bg-[#0D5A1E]/5 text-[#0D5A1E]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Roster format</Label>
          <RadioGroup
            value={form.rosterFormat}
            onValueChange={(v) =>
              update({ rosterFormat: v as "manual" | "auto" })
            }
            className="grid gap-3 sm:grid-cols-2"
          >
            <RosterOption
              value="manual"
              label="Manual rosters"
              description="You assign players to teams yourself."
              checked={form.rosterFormat === "manual"}
            />
            <RosterOption
              value="auto"
              label="Auto-generated rosters"
              description="Players are distributed across teams automatically."
              checked={form.rosterFormat === "auto"}
            />
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}

function RosterOption({
  value,
  label,
  description,
  checked,
}: {
  value: string;
  label: string;
  description: string;
  checked: boolean;
}) {
  return (
    <Label
      htmlFor={`roster-${value}`}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
        checked
          ? "border-[#0D5A1E] bg-[#0D5A1E]/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <RadioGroupItem id={`roster-${value}`} value={value} className="mt-0.5" />
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        <span className="text-xs font-normal text-gray-500">{description}</span>
      </span>
    </Label>
  );
}

function StepTeams({ form, update }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Teams & players"
        subtitle="Set the size of your league and per-team roster rules."
      />
      <div className="space-y-6">
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

        <ToggleRow
          label="Allow substitutes"
          description="Let teams carry substitute players beyond the starting roster."
          checked={form.enableSubstitutes}
          onChange={(v) => update({ enableSubstitutes: v })}
        />

        {form.enableSubstitutes && (
          <NumberField
            label="Maximum substitutes per team"
            value={form.maxSubstitutesPerTeam}
            min={1}
            max={20}
            onChange={(v) => update({ maxSubstitutesPerTeam: v })}
          />
        )}
      </div>
    </div>
  );
}

function StepMatchRules({ form, update }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Match rules"
        subtitle="How often games are played and how points are awarded."
      />
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Match frequency</Label>
            <Select
              value={form.matchFrequency}
              onValueChange={(v) =>
                update({ matchFrequency: v as MatchFrequency })
              }
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

        <div className="space-y-3">
          <Label>Scoring system</Label>
          <RadioGroup
            value={form.scoringSystem}
            onValueChange={(v) => update({ scoringSystem: v as ScoringSystem })}
            className="grid gap-3"
          >
            {SCORING_OPTIONS.map((opt) => (
              <Label
                key={opt.value}
                htmlFor={`scoring-${opt.value}`}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  form.scoringSystem === opt.value
                    ? "border-[#0D5A1E] bg-[#0D5A1E]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <RadioGroupItem
                  id={`scoring-${opt.value}`}
                  value={opt.value}
                />
                <span className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {opt.label}
                  </span>
                  <span className="text-xs font-normal text-gray-500">
                    {opt.hint}
                  </span>
                </span>
              </Label>
            ))}
          </RadioGroup>
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
      </div>
    </div>
  );
}

function StepPlayoffs({ form, update }: StepProps) {
  return (
    <div>
      <StepHeading
        title="Standings & playoffs"
        subtitle="Configure tie-breakers and an optional postseason bracket."
      />
      <div className="space-y-6">
        <ToggleRow
          label="Enable tie-breakers"
          description="Apply tie-breaker rules when teams are level on points."
          checked={form.enableTieBreakers}
          onChange={(v) => update({ enableTieBreakers: v })}
        />

        <ToggleRow
          label="Enable playoffs"
          description="Add a postseason bracket seeded from regular-season standings."
          checked={form.enablePlayOffs}
          onChange={(v) => update({ enablePlayOffs: v })}
        />

        {form.enablePlayOffs && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Playoff format</Label>
              <Select
                value={form.playOffFormat}
                onValueChange={(v) =>
                  update({ playOffFormat: v as PlayOffFormat })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYOFF_FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <NumberField
              label="Teams in playoffs"
              value={form.numberOfTeamsInPlayoffs}
              min={2}
              max={form.maxTeams}
              onChange={(v) => update({ numberOfTeamsInPlayoffs: v })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StepReview({ form }: { form: LeagueForm }) {
  const sportLabel =
    SPORT_OPTIONS.find((s) => s.value === form.sport)?.label ?? form.sport;
  const scoringLabel =
    SCORING_OPTIONS.find((s) => s.value === form.scoringSystem)?.label ??
    form.scoringSystem;
  const frequencyLabel =
    FREQUENCY_OPTIONS.find((s) => s.value === form.matchFrequency)?.label ??
    form.matchFrequency;
  const playoffLabel =
    PLAYOFF_FORMAT_OPTIONS.find((s) => s.value === form.playOffFormat)?.label ??
    form.playOffFormat;

  return (
    <div>
      <StepHeading
        title="Review & create"
        subtitle="Double-check the details below, then create your league."
      />
      <dl className="divide-y divide-gray-100">
        <ReviewRow label="League name" value={form.leagueName || "—"} />
        <ReviewRow label="Sport" value={sportLabel} />
        <ReviewRow
          label="Roster format"
          value={form.rosterFormat === "manual" ? "Manual rosters" : "Auto-generated rosters"}
        />
        <ReviewRow label="Max teams" value={String(form.maxTeams)} />
        <ReviewRow
          label="Min players / team"
          value={String(form.minPlayersPerTeam)}
        />
        <ReviewRow
          label="Substitutes"
          value={
            form.enableSubstitutes
              ? `Up to ${form.maxSubstitutesPerTeam} per team`
              : "Disabled"
          }
        />
        <ReviewRow label="Match frequency" value={frequencyLabel} />
        <ReviewRow
          label="Match duration"
          value={`${form.matchDuration} min`}
        />
        <ReviewRow
          label="Scoring"
          value={
            form.scoringSystem === "custom"
              ? `Custom (W${form.customWin} / D${form.customDraw} / L${form.customLoss})`
              : scoringLabel
          }
        />
        <ReviewRow
          label="Tie-breakers"
          value={form.enableTieBreakers ? "Enabled" : "Disabled"}
        />
        <ReviewRow
          label="Playoffs"
          value={
            form.enablePlayOffs
              ? `${playoffLabel} · ${form.numberOfTeamsInPlayoffs} teams`
              : "Disabled"
          }
        />
      </dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

// ============================================
// Shared inputs
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

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
