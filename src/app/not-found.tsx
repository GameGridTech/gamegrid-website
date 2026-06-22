/**
 * Global 404 Not Found page
 * Branded fallback for any unmatched route. Keeps admins inside the product
 * with quick links back to the dashboard and marketing home.
 */

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <Image
        src="/logos/gamegrid-logo.png"
        alt="GameGrid"
        width={96}
        height={96}
        className="object-contain mb-8"
        priority
      />

      <p
        className="text-6xl font-bold text-[#0D5A1E]"
        style={{ fontFamily: "var(--font-gamegrid-title)" }}
      >
        404
      </p>
      <h1 className="mt-3 text-xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-[#0f5a1f] px-6 py-2.5 text-sm font-bold text-white transition-all hover:shadow-md hover:scale-105"
        >
          Go to dashboard
        </Link>
        <Link
          href="/"
          className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
