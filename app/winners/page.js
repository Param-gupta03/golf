"use client";

import { startTransition, useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Winners() {
  const [winners, setWinners] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;

    const loadWinners = async () => {
      const res = await api.getWinners();
      if (!active) return;

      startTransition(() => {
        setWinners(res.data || []);
        if (!res.ok) {
          setStatus(res.error || "Failed to load winners.");
        }
      });
    };

    loadWinners();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#060707] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">
          Results Board
        </p>
        <h1 className="mt-2 text-4xl font-semibold">Winner history</h1>
        <p className="mt-3 text-white/60">
          Published winners, prize tiers, and payout status from the latest draws.
        </p>

        {status ? <p className="mt-4 text-sm text-amber-200">{status}</p> : null}

        <div className="mt-8 grid gap-4">
          {winners.length ? (
            winners.map((w) => (
              <div
                key={w.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-white/45">Winner</p>
                    <p className="text-lg font-semibold">{w.user_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/45">Tier</p>
                    <p className="text-lg font-semibold">{w.match_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/45">Prize</p>
                    <p className="text-lg font-semibold">Rs. {w.prize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/45">Status</p>
                    <p className="text-lg font-semibold">{w.status ?? "pending"}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-white/55">
              No winners published yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
