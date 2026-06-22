"use client";

/**
 * Dashboard Layout
 * 3-column responsive layout: sidebar | main content | alerts panel
 * - Desktop (lg+): sidebar fixed left, main + alerts side by side
 * - Tablet (md-lg): sidebar as sheet, main + alerts stacked
 * - Mobile (<md): single column, sidebar as sheet, alerts below
 * Wraps children with DashboardProvider for shared league state.
 */

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DashboardProvider } from "@/lib/dashboard-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import DashboardSidebar from "@/components/custom/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/custom/dashboard/DashboardTopBar";
import LeagueNavBar from "@/components/custom/dashboard/LeagueNavBar";
import AlertsPanel from "@/components/custom/dashboard/AlertsPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The alerts panel only belongs on the dashboard home; every other section
  // (settings, teams, schedule, wizard, etc.) gets the full content width.
  const showAlertsPanel = pathname === "/dashboard";

  // Auth guard: redirect unauthenticated users to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Full-screen loader ONLY for initial auth check (not authenticated yet).
  // We check !isAuthenticated so that refreshUser() toggling isLoading
  // doesn't unmount the DashboardProvider and destroy dashboard state.
  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#0f5a1f]" />
      </div>
    );
  }

  // Don't render dashboard for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-white">
        {/* ── Desktop Sidebar: rounded, floating, light gray, not connected to edges ── */}
        <aside className="hidden lg:flex lg:flex-col lg:w-[220px] xl:w-[260px] lg:fixed lg:top-4 lg:left-4 lg:bottom-4 lg:rounded-2xl bg-[#EFEFEF] z-30">
          <DashboardSidebar />
        </aside>

        {/* ── Mobile / Tablet Sidebar Sheet ── */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button
              className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* ── Main Area (offset for floating sidebar on lg+) ── */}
        <div className="lg:pl-[252px] xl:pl-[292px] pr-4 sm:pr-6">
          {/* Top bar - light gray rounded box, not connected to edges */}
          <div className="px-4 sm:px-6 pt-4">
            <DashboardTopBar />
          </div>

          {/* League section nav — replaces the old sidebar "Manage" group and
              persists across league pages so the active section stays visible */}
          <div className="px-4 sm:px-6 pt-4">
            <LeagueNavBar />
          </div>

          {/* Content grid: main | alerts - padding so boxes don't touch edges */}
          <div className="flex flex-col xl:flex-row gap-6 px-4 sm:px-6 lg:pr-6 pb-6">
            {/* Main scrollable content */}
            <main className="flex-1 min-w-0 pt-4">
              {children}
            </main>

            {/* Alerts panel: only on the dashboard home, right column on xl+ */}
            {showAlertsPanel && (
              <aside className="w-full xl:w-[320px] xl:min-w-[320px] shrink-0">
                <AlertsPanel />
              </aside>
            )}
          </div>
        </div>

        {/* App-wide toast surface */}
        <Toaster position="top-right" richColors />
      </div>
    </DashboardProvider>
  );
}
