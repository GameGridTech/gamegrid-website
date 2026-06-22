"use client";

/** Help & support placeholder (roadmap) */

import { HelpCircle } from "lucide-react";
import ComingSoon from "@/components/custom/dashboard/ComingSoon";

export default function HelpPage() {
  return (
    <ComingSoon
      title="Help & Support"
      icon={HelpCircle}
      description="Find answers fast. Browse guides, watch tutorials, and reach the GameGrid support team right from the console."
      features={[
        "Searchable help center and FAQs",
        "Step-by-step admin guides",
        "Contact support and track tickets",
      ]}
    />
  );
}
