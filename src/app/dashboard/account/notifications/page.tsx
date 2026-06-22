"use client";

/** Notification preferences placeholder (roadmap) */

import { Bell } from "lucide-react";
import ComingSoon from "@/components/custom/dashboard/ComingSoon";

export default function NotificationsPage() {
  return (
    <ComingSoon
      title="Notifications"
      icon={Bell}
      description="Fine-tune which alerts you receive and how — email, push, or in-app — for game results, registrations, and league activity."
      features={[
        "Per-category notification controls",
        "Choose email, push, or in-app delivery",
        "Quiet hours and digest summaries",
      ]}
    />
  );
}
