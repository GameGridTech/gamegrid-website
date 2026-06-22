"use client";

/**
 * DashboardSidebar
 * Left sidebar navigation: GameGrid logo, "Create League" CTA, league switcher,
 * and Account links. Active route is highlighted via usePathname. Per-league
 * management sections now live in the horizontal LeagueNavBar, not here.
 *
 * Leagues come from DashboardContext (fetched from the API). Selecting a league
 * sets it as the active league across the whole dashboard.
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  CreditCard,
  Bell,
  HelpCircle,
  History,
  ChevronDown,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { League } from "@/lib/api";

interface DashboardSidebarProps {
  /** Callback when a navigation item is clicked (used to close mobile sheet) */
  onNavigate?: () => void;
}

/** A single nav link definition. `href` may be a function of the active league. */
interface NavLink {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string | ((leagueId: string) => string);
  /** Marks not-yet-implemented modules with a "Soon" pill */
  soon?: boolean;
  /** Requires an active league to be meaningful */
  needsLeague?: boolean;
}

export default function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const { leagues, leaguesLoading, selectedLeague, selectLeague } =
    useDashboard();
  const pathname = usePathname();

  /** Handle league selection and optionally close mobile sheet */
  const handleLeagueClick = (league: League) => {
    selectLeague(league);
    onNavigate?.();
  };

  /** Resolve a link's href against the currently selected league */
  const resolveHref = (link: NavLink): string => {
    if (typeof link.href === "function") {
      return selectedLeague ? link.href(selectedLeague.id) : "/dashboard";
    }
    return link.href;
  };

  /** Is this link the current route? */
  const isActiveLink = (href: string): boolean => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* ── Logo ── */}
      <div className="flex items-center gap-2 px-5 py-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center"
          onClick={onNavigate}
        >
          <Image
            src="/logos/navbar.png"
            alt="GameGrid logo"
            width={100}
            height={100}
            priority
          />
        </Link>
      </div>

      <Separator />

      {/* ── Create League CTA ── */}
      <div className="px-3 pt-4">
        <Link
          href="/dashboard/leagues/new"
          onClick={onNavigate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D5A1E] px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0a4718]"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          <Plus className="h-4 w-4" />
          Create League
        </Link>
      </div>

      {/* ── Scrollable nav area ── */}
      {/* min-h-0 lets this flex child shrink below its content size so the
          ScrollArea viewport scrolls internally instead of overflowing the
          fixed-height sidebar (flex items default to min-height:auto). */}
      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        {/* ── LEAGUES switcher ── */}
        <div className="mb-6">
          <p
            className="mb-2 px-2 text-sm font-bold uppercase tracking-wide text-[#000000]"
            style={{ fontFamily: "var(--font-gamegrid-title)" }}
          >
            Leagues
          </p>

          <nav className="space-y-0.5">
            {leaguesLoading ? (
              <div className="space-y-2 px-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-lg" />
                ))}
              </div>
            ) : leagues.length === 0 ? (
              <p className="px-2 py-2 text-sm italic text-[#717171]">
                No leagues yet
              </p>
            ) : (
              leagues.map((league) => {
                const isActive = selectedLeague?.id === league.id;
                return (
                  <button
                    key={league.id}
                    onClick={() => handleLeagueClick(league)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${
                      isActive
                        ? "bg-white text-[#0D5A1E]"
                        : "text-[#000000] hover:bg-white/50"
                    }`}
                  >
                    {league.name}
                  </button>
                );
              })
            )}
          </nav>
        </div>

        <Separator className="mb-4" />

        {/* ── ACCOUNT section ── */}
        <div>
          <div className="mb-2 flex items-center justify-between px-2">
            <p
              className="text-sm font-bold uppercase tracking-wide text-[#000000]"
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              Account
            </p>
            <ChevronDown className="h-4 w-4 text-[#717171]" />
          </div>

          <nav className="space-y-0.5">
            {ACCOUNT_LINKS.map((link) => (
              <SidebarLink
                key={link.label}
                link={link}
                href={resolveHref(link)}
                active={isActiveLink(resolveHref(link))}
                onNavigate={onNavigate}
              />
            ))}
          </nav>
        </div>
      </ScrollArea>
    </div>
  );
}

/** A single rendered sidebar link with active/disabled/soon states */
function SidebarLink({
  link,
  href,
  active,
  disabled,
  onNavigate,
}: {
  link: NavLink;
  href: string;
  active: boolean;
  disabled?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = link.icon;

  const baseClasses =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors";

  if (disabled) {
    return (
      <span
        className={`${baseClasses} cursor-not-allowed text-[#b5b5b5]`}
        title="Select a league first"
      >
        <Icon className="h-4 w-4 text-[#cfcfcf]" />
        {link.label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${baseClasses} ${
        active
          ? "bg-white font-semibold text-[#0D5A1E]"
          : "text-[#000000] hover:bg-[#e3e3e3]"
      }`}
    >
      <Icon
        className={`h-4 w-4 ${active ? "text-[#0D5A1E]" : "text-[#717171]"}`}
      />
      <span className="flex-1">{link.label}</span>
      {link.soon && (
        <span className="rounded-full bg-[#e3e3e3] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#717171]">
          Soon
        </span>
      )}
    </Link>
  );
}

/** Account-level navigation links */
const ACCOUNT_LINKS: NavLink[] = [
  { label: "League History", href: "/dashboard/account/history", icon: History },
  { label: "Manage Subscription", href: "/dashboard/account/subscription", icon: CreditCard, soon: true },
  { label: "Notifications", href: "/dashboard/account/notifications", icon: Bell, soon: true },
  { label: "Help & Support", href: "/dashboard/help", icon: HelpCircle, soon: true },
];
