"use client";

/**
 * ComingSoon
 * Shared placeholder for modules that are on the GameGrid roadmap but not yet
 * backed by the API. Communicates clearly that the feature is planned rather
 * than broken, and (optionally) lists the capabilities to expect.
 */

import { LucideIcon, Sparkles } from "lucide-react";
import PageHeader from "@/components/custom/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";

interface ComingSoonProps {
  title: string;
  /** Icon representing the module */
  icon: LucideIcon;
  /** Short description of what the module will do */
  description: string;
  /** Optional bullet list of planned capabilities */
  features?: string[];
}

export default function ComingSoon({
  title,
  icon: Icon,
  description,
  features,
}: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        actions={
          <Badge className="bg-[#0D5A1E]/10 text-[#0D5A1E]">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Coming soon
          </Badge>
        }
      />

      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon className="h-8 w-8 text-[#0D5A1E]" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-800">
          {title} is on the roadmap
        </h2>
        <p className="mx-auto max-w-lg text-sm text-gray-500">{description}</p>

        {features && features.length > 0 && (
          <ul className="mx-auto mt-6 grid max-w-md gap-2 text-left">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm"
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#0D5A1E]" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
