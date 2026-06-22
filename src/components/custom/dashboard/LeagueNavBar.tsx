"use client";

/**
 * LeagueNavBar
 * Horizontal navigation for the selected league's management sections,
 * relocated from the sidebar "Manage" group. It reuses the exact same routes
 * so existing destinations keep working, and derives the active tab from the
 * current pathname. On small screens it scrolls horizontally instead of
 * overflowing the layout.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ListOrdered,
  Trophy,
  UserCog,
  Settings,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** A league section tab. `needsLeague` items require an active league. */
interface LeagueNavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  needsLeague?: boolean;
}

// Mirrors the navigable items from the old sidebar "Manage" section. "Schedule"
// is intentionally excluded because it now has a dedicated "View Schedule"
// button beside the Upcoming Games header; not-yet-implemented ("soon") modules
// are also omitted to keep the bar to real destinations.
const LEAGUE_NAV_ITEMS: LeagueNavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Teams & Rosters", href: "/dashboard/teams", icon: Users, needsLeague: true },
  { label: "Standings", href: "/dashboard/standings", icon: ListOrdered, needsLeague: true },
  { label: "Playoffs", href: "/dashboard/playoffs", icon: Trophy, needsLeague: true },
  { label: "Members", href: "/dashboard/members", icon: UserCog, needsLeague: true },
  { label: "League Settings", href: "/dashboard/settings", icon: Settings, needsLeague: true },
];

export default function LeagueNavBar() {
  const pathname = usePathname();
  const { selectedLeague } = useDashboard();

  /** Exact match for the Overview root; prefix match for nested section routes. */
  const isActive = (href: string): boolean => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="League sections"
      // overflow-x-auto keeps the tabs on a single row and scrolls on small
      // screens rather than wrapping/overflowing the content column.
      className="flex items-center gap-2 overflow-x-auto pb-1"
    >
      {LEAGUE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        const disabled = item.needsLeague && !selectedLeague;

        // Shared pill styling; active tab uses the brand green, others a light
        // gray bubble consistent with the rest of the dashboard.
        const pillClasses = cn(
          "shrink-0 rounded-full px-4 font-bold uppercase tracking-wide",
          active
            ? "bg-[#0D5A1E] text-white hover:bg-[#0D5A1E]/90 hover:text-white"
            : "bg-[#EFEFEF] text-[#000000] hover:bg-[#e3e3e3]"
        );

        // No league selected yet → render a non-interactive disabled tab.
        if (disabled) {
          return (
            <Button
              key={item.label}
              size="sm"
              variant="ghost"
              disabled
              title="Select a league first"
              className={pillClasses}
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        }

        return (
          <Button
            key={item.label}
            asChild
            size="sm"
            variant="ghost"
            className={pillClasses}
            style={{ fontFamily: "var(--font-gamegrid-title)" }}
          >
            <Link href={item.href} aria-current={active ? "page" : undefined}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
