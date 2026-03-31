"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState("");
  const [plan, setPlan] = useState("monthly");
  const [subscription, setSubscription] = useState(null);
  const [charities, setCharities] = useState([]);
  const [selectedCharityId, setSelectedCharityId] = useState("");
  const [charityPercentage, setCharityPercentage] = useState(10);
  const [editingScoreId, setEditingScoreId] = useState("");
  const [editScoreValue, setEditScoreValue] = useState("");
  const [status, setStatus] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchScores = async (userId) => {
    const res = await api.getScores(userId);
    setScores(res.data || []);
  };

  const fetchSubscription = async (userId) => {
    const res = await api.getSubscription(userId);
    setSubscription(res.data || null);
  };

  const fetchCharities = async () => {
    const res = await api.getCharities();
    setCharities(res.data || []);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/auth");
        return;
      }

      setUser(data.user);
      fetchScores(data.user.id);
      fetchSubscription(data.user.id);
      fetchCharities();

      const userProfile = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      const profile = userProfile.data;
      if (profile?.charity_id) {
        setSelectedCharityId(profile.charity_id);
      }
      if (profile?.charity_percentage) {
        setCharityPercentage(profile.charity_percentage);
      }
    };

    getUser();
  }, [router]);

  useEffect(() => {
    const checkoutState = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    const returnedPlan = searchParams.get("plan");

    if (!user || !checkoutState) {
      return;
    }

    const verifyCheckout = async () => {
      if (checkoutState === "cancelled") {
        setStatus("Checkout was cancelled.");
        router.replace("/dashboard");
        return;
      }

      if (checkoutState !== "success" || !sessionId || !returnedPlan) {
        return;
      }

      const result = await api.verifyCheckoutSession(sessionId, user.id, returnedPlan);

      if (!result.ok) {
        setStatus(result.error || "Payment verification failed.");
        router.replace("/dashboard");
        return;
      }

      setStatus("Payment confirmed. Subscription is active.");
      fetchSubscription(user.id);
      router.replace("/dashboard");
    };

    verifyCheckout();
  }, [router, searchParams, user]);

  const handleAddScore = async () => {
    if (!newScore || !user) return;

    const result = await api.addScore(user.id, Number(newScore));
    if (!result.ok) {
      setStatus(result.error || "Failed to save score.");
      return;
    }

    setStatus("Score saved.");
    setNewScore("");
    fetchScores(user.id);
  };

  const handleSubscribe = async () => {
    if (!user) return;

    setCheckoutLoading(true);
    setStatus("");

    const result = await api.createCheckoutSession(user.id, user.email, plan);
    if (!result.ok) {
      setStatus(result.error || "Subscription failed.");
      setCheckoutLoading(false);
      return;
    }

    if (!result.data?.url) {
      setStatus("Checkout URL was not returned.");
      setCheckoutLoading(false);
      return;
    }

    window.location.href = result.data.url;
  };

  const handleSaveCharity = async () => {
    if (!user || !selectedCharityId) {
      setStatus("Select a charity first.");
      return;
    }

    const result = await api.updateCharityChoice(
      user.id,
      selectedCharityId,
      charityPercentage,
    );

    setStatus(result.ok ? "Charity preference updated." : result.error || "Failed to save charity preference.");
  };

  const handleEditScore = async () => {
    if (!editingScoreId || !editScoreValue || !user) {
      setStatus("Pick a saved score and enter a replacement value.");
      return;
    }

    const result = await api.updateScore(editingScoreId, Number(editScoreValue));
    setStatus(result.ok ? "Score updated." : result.error || "Failed to update score.");
    if (result.ok) {
      setEditingScoreId("");
      setEditScoreValue("");
      fetchScores(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-[#07110d] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/70">
              Subscriber Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-semibold">
              {user?.email ?? "Loading account..."}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/winners")}
              className="rounded-full border border-white/15 px-4 py-2"
            >
              Winners
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-white px-4 py-2 font-medium text-black"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-semibold">Score entry</h2>
            <p className="mt-2 text-white/60">
              Add your latest Stableford score. The oldest entry is removed after
              five rounds.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <input
                type="number"
                min="1"
                max="45"
                placeholder="Enter score (1-45)"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                className="min-w-[220px] flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              />
              <button
                onClick={handleAddScore}
                className="rounded-full bg-emerald-300 px-5 py-3 font-semibold text-black"
              >
                Save score
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium">Latest scores</h3>
              <div className="mt-4 space-y-3">
                {scores.length ? (
                  scores.map((s, index) => (
                    <div
                      key={s.id ?? `${s.score}-${index}`}
                      className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                    >
                      <span className="text-2xl font-semibold">{s.score}</span>
                      <span className="text-sm text-white/50">
                        {s.played_at || s.created_at || "Recent round"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50">No scores yet.</p>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <h3 className="text-lg font-medium">Edit a saved score</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_140px]">
                <select
                  value={editingScoreId}
                  onChange={(e) => setEditingScoreId(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <option value="">Select score</option>
                  {scores.map((score) => (
                    <option key={score.id} value={score.id}>
                      {score.score} - {score.played_at || score.created_at || "Saved round"}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="45"
                  value={editScoreValue}
                  onChange={(e) => setEditScoreValue(e.target.value)}
                  placeholder="New value"
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <button
                  onClick={handleEditScore}
                  className="rounded-full border border-white/15 px-5 py-3"
                >
                  Update
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Subscription</h2>
              <p className="mt-2 text-white/60">
                Activate access to score tracking, draws, and charity giving.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setPlan("monthly")}
                  className={`rounded-full px-4 py-2 ${
                    plan === "monthly"
                      ? "bg-white text-black"
                      : "border border-white/15"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPlan("yearly")}
                  className={`rounded-full px-4 py-2 ${
                    plan === "yearly"
                      ? "bg-white text-black"
                      : "border border-white/15"
                  }`}
                >
                  Yearly
                </button>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={checkoutLoading}
                className="mt-5 w-full rounded-full bg-emerald-300 px-5 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutLoading ? "Redirecting to payment..." : "Activate subscription"}
              </button>

              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/70">
                <p>Status: {subscription?.status ?? "inactive"}</p>
                <p>Plan: {subscription?.plan ?? "not selected"}</p>
                <p>Renewal: {subscription?.renewal_date ?? "not available"}</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Selected charity</h2>
              <p className="mt-2 text-white/60">
                Pick your charity recipient and contribution percentage.
              </p>

              <div className="mt-5 space-y-4">
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <option value="">Choose charity</option>
                  {charities.map((charity) => (
                    <option key={charity.id} value={charity.id}>
                      {charity.name || charity.title || `Charity ${charity.id}`}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={charityPercentage}
                  onChange={(e) => setCharityPercentage(Number(e.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                />
                <button
                  onClick={handleSaveCharity}
                  className="w-full rounded-full border border-white/15 px-5 py-3"
                >
                  Save charity settings
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Participation summary</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-white/50">Scores tracked</p>
                  <p className="mt-2 text-3xl font-semibold">{scores.length}</p>
                </div>
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-white/50">Draw eligibility</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {scores.length === 5 ? "Ready" : "Pending"}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-white/50">Upcoming draws</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {subscription?.status === "active" ? "1" : "0"}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-sm text-white/50">Current contribution</p>
                  <p className="mt-2 text-3xl font-semibold">{charityPercentage}%</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {status ? <p className="mt-6 text-sm text-emerald-200">{status}</p> : null}
      </div>
    </div>
  );
}
