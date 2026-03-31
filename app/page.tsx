"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const subscriptionRows = [
  {
    label: "Plans",
    value: "Monthly plan and Yearly plan (discounted rate)",
  },
  {
    label: "Gateway",
    value: "Stripe (or equivalent PCI-compliant provider)",
  },
  {
    label: "Access Control",
    value: "Non-subscribers receive restricted access to platform features",
  },
  {
    label: "Lifecycle",
    value: "Handles renewal, cancellation, and lapsed-subscription states",
  },
  {
    label: "Validation",
    value: "Real-time subscription status check on every authenticated request",
  },
];

export default function Home() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserEmail(user?.email ?? "");
    };

    loadUser();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#29453a_0%,#09110d_45%,#020303_100%)] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-16">
        <header className="flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300/75">
            Fairway For Good
          </p>
          <div className="flex items-center gap-3">
            {userEmail ? (
              <span className="hidden text-sm text-white/65 sm:block">{userEmail}</span>
            ) : null}
            <button
              onClick={() => router.push(userEmail ? "/dashboard" : "/auth")}
              className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white hover:text-black"
            >
              {userEmail ? "Open dashboard" : "Sign in"}
            </button>
          </div>
        </header>

        <section className="grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] sm:text-6xl">
              Play golf.
              <span className="block text-emerald-300">Win monthly rewards.</span>
              <span className="block text-white/72">Fund a charity you actually care about.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg text-white/70">
              Track your last five Stableford scores, stay eligible for monthly
              draws, and send part of every subscription into a live charity
              impact engine.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/auth")}
                className="rounded-full bg-emerald-300 px-6 py-3 font-semibold text-black transition hover:bg-emerald-200"
              >
                Get started
              </button>
              <button
                onClick={() => router.push("/winners")}
                className="rounded-full border border-white/15 px-6 py-3 hover:bg-white hover:text-black"
              >
                View winners
              </button>
            </div>
          </div>

          <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="rounded-[1.5rem] bg-black/35 p-5">
              <p className="text-sm text-white/50">How it works</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-lg font-medium">1. Subscribe monthly or yearly</p>
                  <p className="text-sm text-white/60">
                    Unlock score tracking, draw access, and charity allocation.
                  </p>
                </div>
                <div>
                  <p className="text-lg font-medium">2. Save your latest 5 scores</p>
                  <p className="text-sm text-white/60">
                    The app automatically rotates out the oldest round.
                  </p>
                </div>
                <div>
                  <p className="text-lg font-medium">3. Enter monthly draws</p>
                  <p className="text-sm text-white/60">
                    Match 3, 4, or 5 numbers and track prize status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-3xl">01</p>
            <h3 className="mt-4 text-xl font-semibold">Score rhythm</h3>
            <p className="mt-2 text-white/65">
              Enter scores from 1 to 45, keep only the latest five, and see
              your rounds in reverse chronological order.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-3xl">02</p>
            <h3 className="mt-4 text-xl font-semibold">Monthly prize engine</h3>
            <p className="mt-2 text-white/65">
              Draws can be run by admin, winners are grouped by match tier, and
              payout status stays visible.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <p className="text-3xl">03</p>
            <h3 className="mt-4 text-xl font-semibold">Charity-first feeling</h3>
            <p className="mt-2 text-white/65">
              The product leads with impact instead of golf cliches, keeping the
              cause front and center.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
