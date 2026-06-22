"use client";

/**
 * Profile Page
 * Read-only view of the signed-in admin's account details. Profile editing is
 * handled in the GameGrid app today, so editing here is flagged as roadmap.
 */

import Image from "next/image";
import { Sparkles, Mail, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import PageHeader from "@/components/custom/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "—";
  const initials =
    user?.firstName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";
  const profilePicture = user?.playerProfile?.profilePicture;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        subtitle="Your GameGrid account details."
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {profilePicture ? (
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-gray-200">
              <Image
                src={profilePicture}
                alt={fullName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0D5A1E] text-2xl font-bold text-white">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <InfoRow icon={<UserIcon className="h-4 w-4" />} label="Name" value={fullName} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user?.email ?? "—"} />
        </div>
      </div>

      {/* Editing roadmap note */}
      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#0D5A1E]" />
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">
              Profile editing on the web
            </p>
            <Badge className="bg-[#0D5A1E]/10 text-[#0D5A1E]">Coming soon</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            For now, update your name and photo in the GameGrid app. Web-based
            profile editing is on the roadmap.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
      <div className="rounded-lg bg-[#0D5A1E]/5 p-2 text-[#0D5A1E]">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
