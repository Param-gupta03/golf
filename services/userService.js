import { supabase } from "@/lib/supabaseClient";

export async function getUserService(userId) {
  if (!userId) {
    return { ok: false, error: "userId is required", data: null };
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message, data: null };
  }

  return {
    ok: true,
    data,
  };
}

export async function upsertUserProfileService(payload) {
  const { data, error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select()
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message, data: null };
  }

  return {
    ok: true,
    data,
  };
}
