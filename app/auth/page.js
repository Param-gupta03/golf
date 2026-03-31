"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const profileResult = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        router.replace(
          profileResult.data?.role === "admin" ? "/admin" : "/dashboard",
        );
      }
    };

    loadUser();
  }, [router]);

  const ensureUserProfile = async (user) => {
    await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email,
        role: "subscriber",
      },
      { onConflict: "id" },
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          await ensureUserProfile(data.user);
        }

        setMessage(
          "Account created. If email confirmation is enabled, confirm your email and then log in.",
        );
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          await ensureUserProfile(data.user);
        }

        const profileResult = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        router.push(
          profileResult.data?.role === "admin" ? "/admin" : "/dashboard",
        );
      }
    } catch (error) {
      setMessage(error.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#20342a_0%,#08110d_45%,#020303_100%)] px-6 py-16 text-white">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">
            Golf For Good
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight">
            Subscribe, track your last five rounds, and fund real causes.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            This platform connects golf performance, monthly rewards, and
            charity giving in one clean experience.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-2xl shadow-emerald-950/30">
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => setMode("login")}
              className={`rounded-full px-4 py-2 text-sm ${
                mode === "login"
                  ? "bg-white text-black"
                  : "border border-white/15 text-white/75"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 text-sm ${
                mode === "signup"
                  ? "bg-white text-black"
                  : "border border-white/15 text-white/75"
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="space-y-4">
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/35"
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-white/35"
            />

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full rounded-full bg-emerald-300 px-5 py-3 font-semibold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : mode === "signup"
                  ? "Create account"
                  : "Enter dashboard"}
            </button>

            {message ? (
              <p className="text-sm text-amber-200">{message}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
