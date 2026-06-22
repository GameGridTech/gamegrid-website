"use client";

/**
 * PageHeader
 * Shared header for dashboard management pages: title, optional subtitle,
 * and an optional actions slot on the right. Keeps section pages visually
 * consistent with the GameGrid title styling.
 */

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional right-aligned action buttons */
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1
          className="text-2xl font-bold uppercase tracking-wide text-gray-900 sm:text-3xl"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
