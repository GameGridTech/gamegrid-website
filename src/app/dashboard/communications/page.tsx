"use client";

/** Communications module placeholder (roadmap) */

import { Megaphone } from "lucide-react";
import ComingSoon from "@/components/custom/dashboard/ComingSoon";

export default function CommunicationsPage() {
  return (
    <ComingSoon
      title="Communications"
      icon={Megaphone}
      description="Reach your players where they are. Send announcements, schedule changes, and reminders via in-app notifications, email, and SMS."
      features={[
        "Broadcast announcements to the whole league or a single team",
        "Email and SMS blasts",
        "Automated game reminders and schedule-change alerts",
        "Delivery and read tracking",
      ]}
    />
  );
}
