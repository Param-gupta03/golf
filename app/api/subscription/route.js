import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ ok: false, error: "userId is required", data: null }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Response.json({
    ok: !error,
    data,
    error: error?.message ?? null,
  });
}

export async function POST(req) {
  const { userId, plan } = await req.json();

  const { data, error } = await supabase
    .from("subscriptions")
    .insert([
      {
        user_id: userId,
        plan,
        status: "active",
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ]);

  await supabase
    .from("users")
    .update({ subscription_status: "active" })
    .eq("id", userId);

  return Response.json({
    ok: !error,
    data,
    error: error?.message ?? null,
  });
}
