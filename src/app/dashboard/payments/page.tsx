"use client";

/** Payments module placeholder (roadmap) */

import { CreditCard } from "lucide-react";
import ComingSoon from "@/components/custom/dashboard/ComingSoon";

export default function PaymentsPage() {
  return (
    <ComingSoon
      title="Payments"
      icon={CreditCard}
      description="Collect league and registration fees, track who has paid, and issue refunds with built-in Stripe-powered payments."
      features={[
        "Set per-league or per-player fees",
        "Track paid, pending, and overdue balances",
        "Automatic receipts and refunds",
        "Payout reporting for league finances",
      ]}
    />
  );
}
