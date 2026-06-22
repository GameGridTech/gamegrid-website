"use client";

/** Registration module placeholder (roadmap) */

import { ClipboardList } from "lucide-react";
import ComingSoon from "@/components/custom/dashboard/ComingSoon";

export default function RegistrationPage() {
  return (
    <ComingSoon
      title="Registration"
      icon={ClipboardList}
      description="Build custom registration forms, collect player sign-ups, and manage waivers and approvals — all without leaving the admin console."
      features={[
        "Drag-and-drop registration form builder",
        "Custom fields, waivers, and consent collection",
        "Approve, waitlist, or decline applicants",
        "Sync approved players straight into league rosters",
      ]}
    />
  );
}
