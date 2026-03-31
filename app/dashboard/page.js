import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

function DashboardFallback() {
  return (
    <div className="min-h-screen bg-[#07110d] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">
          Subscriber Dashboard
        </p>
        <h1 className="mt-4 text-3xl font-semibold">Loading dashboard...</h1>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardClient />
    </Suspense>
  );
}
