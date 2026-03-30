import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase
    .from("winners")
    .select("*")
    .order("created_at", { ascending: false });

  return Response.json({
    ok: !error,
    data: data ?? [],
    error: error?.message ?? null,
  });
}

export async function POST(req) {
  const { winnerId, updates } = await req.json();

  const { data, error } = await supabase
    .from("winners")
    .update(updates)
    .eq("id", winnerId)
    .select()
    .maybeSingle();

  return Response.json({
    ok: !error,
    data,
    error: error?.message ?? null,
  });
}
