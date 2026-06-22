"use client";

/** Subscription / billing module placeholder (roadmap) */

import { CreditCard } from "lucide-react";
import ComingSoon from "@/components/custom/dashboard/ComingSoon";

export default function SubscriptionPage() {
  return (
    <ComingSoon
      title="Manage Subscription"
      icon={CreditCard}
      description="Manage your GameGrid plan, upgrade for more leagues and advanced features, and view billing history."
      features={[
        "Compare and switch plans",
        "Update payment methods",
        "Download invoices and billing history",
        "Manage seats and add-ons",
      ]}
    />
  );
}
