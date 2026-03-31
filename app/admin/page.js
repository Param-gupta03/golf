"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("simulate");
  const [users, setUsers] = useState([]);
  const [scores, setScores] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [winners, setWinners] = useState([]);
  const [charities, setCharities] = useState([]);
  const [accessChecked, setAccessChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadAdminData = async () => {
    const [usersResult, scoresResult, subscriptionsResult, winnersResult, charitiesResult] =
      await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("scores").select("*"),
        supabase.from("subscriptions").select("*"),
        supabase.from("winners").select("*"),
        supabase.from("charities").select("*"),
      ]);

    return {
      users: usersResult.data ?? [],
      scores: scoresResult.data ?? [],
      subscriptions: subscriptionsResult.data ?? [],
      winners: winnersResult.data ?? [],
      charities: charitiesResult.data ?? [],
    };
  };

  useEffect(() => {
    let active = true;

    const boot = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        router.replace("/auth");
        return;
      }

      const profileResult = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (profileResult.data?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setIsAdmin(true);
      setAccessChecked(true);

      const snapshot = await loadAdminData();
      if (!active) return;

      startTransition(() => {
        setUsers(snapshot.users);
        setScores(snapshot.scores);
        setSubscriptions(snapshot.subscriptions);
        setWinners(snapshot.winners);
        setCharities(snapshot.charities);
      });
    };

    boot();

    return () => {
      active = false;
    };
  }, [router]);

  if (!accessChecked || !isAdmin) {
    return (
      <div className="min-h-screen bg-black px-6 py-10 text-white">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">
            Admin Control
          </p>
          <h1 className="mt-4 text-3xl font-semibold">Checking access...</h1>
          <p className="mt-3 text-white/65">
            We&apos;re verifying whether this account has admin permissions.
          </p>
        </div>
      </div>
    );
  }

  const handleDraw = async () => {
    const res = await api.runDraw(mode);
    setResult(res.data ?? null);
    setStatus(
      res.ok
        ? mode === "simulate"
          ? "Simulation completed."
          : "Draw published successfully."
        : res.error || "Draw failed.",
    );
    const snapshot = await loadAdminData();
    setUsers(snapshot.users);
    setScores(snapshot.scores);
    setSubscriptions(snapshot.subscriptions);
    setWinners(snapshot.winners);
    setCharities(snapshot.charities);
  };

  const updateWinnerState = async (winnerId, updates) => {
    const res = await api.updateWinner(winnerId, updates);
    setStatus(res.ok ? "Winner updated." : res.error || "Failed to update winner.");
    const snapshot = await loadAdminData();
    setUsers(snapshot.users);
    setScores(snapshot.scores);
    setSubscriptions(snapshot.subscriptions);
    setWinners(snapshot.winners);
    setCharities(snapshot.charities);
  };

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">
          Admin Control
        </p>
        <h1 className="mt-2 text-4xl font-semibold">Admin dashboard</h1>
        <p className="mt-3 max-w-2xl text-white/65">
          Full control for users, subscriptions, scores, charities, draws,
          winner verification, payouts, and reporting.
        </p>

        <div className="mt-8 grid gap-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Draw management</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => setMode("simulate")}
                className={`rounded-full px-4 py-2 ${mode === "simulate" ? "bg-white text-black" : "border border-white/15"}`}
              >
                Run simulation
              </button>
              <button
                onClick={() => setMode("publish")}
                className={`rounded-full px-4 py-2 ${mode === "publish" ? "bg-white text-black" : "border border-white/15"}`}
              >
                Publish draw
              </button>
              <button
                onClick={handleDraw}
                className="rounded-full bg-emerald-300 px-5 py-3 font-semibold text-black"
              >
                Execute
              </button>
            </div>

            {status ? <p className="mt-4 text-sm text-emerald-200">{status}</p> : null}

            {result ? (
              <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/70">
                <p>Mode: {result.mode ?? mode}</p>
                <p>Numbers: {Array.isArray(result.numbers) ? result.numbers.join(", ") : "-"}</p>
                <p>Winners created: {result.winnersCreated ?? 0}</p>
                <p>Draw id: {result.draw?.id ?? "n/a"}</p>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/55">Total users</p>
              <p className="mt-2 text-3xl font-semibold">{users.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/55">Active subscriptions</p>
              <p className="mt-2 text-3xl font-semibold">
                {subscriptions.filter((item) => item.status === "active").length}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/55">Total prize pool</p>
              <p className="mt-2 text-3xl font-semibold">
                Rs. {subscriptions.filter((item) => item.status === "active").length * 100}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/55">Charity contributions</p>
              <p className="mt-2 text-3xl font-semibold">
                {users.filter((item) => item.charity_id).length}
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">User management</h2>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                {users.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-black/20 p-4">
                    <p className="font-medium text-white">{entry.email || entry.id}</p>
                    <p>Role: {entry.role ?? "subscriber"}</p>
                    <p>Charity: {entry.charity_id ?? "not selected"}</p>
                    <p>Contribution: {entry.charity_percentage ?? 10}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Score management</h2>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                {scores.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-black/20 p-4">
                    <p className="font-medium text-white">User: {entry.user_id}</p>
                    <p>Score: {entry.score}</p>
                    <p>Date: {entry.played_at || entry.created_at || "n/a"}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Charity management</h2>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                {charities.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-black/20 p-4">
                    <p className="font-medium text-white">{entry.name || entry.title || entry.id}</p>
                    <p>{entry.description || "No description yet."}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Winner verification</h2>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                {winners.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-black/20 p-4">
                    <p className="font-medium text-white">User: {entry.user_id}</p>
                    <p>Tier: {entry.match_type}</p>
                    <p>Prize: Rs. {entry.prize}</p>
                    <p>Status: {entry.status ?? "pending"}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => updateWinnerState(entry.id, { status: "approved" })}
                        className="rounded-full border border-white/15 px-3 py-1"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => updateWinnerState(entry.id, { status: "rejected" })}
                        className="rounded-full border border-white/15 px-3 py-1"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => updateWinnerState(entry.id, { status: "paid" })}
                        className="rounded-full bg-white px-3 py-1 text-black"
                      >
                        Mark paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
