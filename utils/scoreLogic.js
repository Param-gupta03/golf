import { supabase } from "@/lib/supabaseClient";

export const addScore = async (userId, newScore) => {
  const { data: scores, error: fetchError } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (fetchError) {
    throw fetchError;
  }

  const currentScores = scores ?? [];

  if (currentScores.length >= 5) {
    const oldest = currentScores[0];
    const { error: deleteError } = await supabase
      .from("scores")
      .delete()
      .eq("id", oldest.id);

    if (deleteError) {
      throw deleteError;
    }
  }

  const payload = {
    user_id: userId,
    score: newScore,
    played_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase.from("scores").insert([payload]);

  if (insertError) {
    const fallbackPayload = {
      user_id: userId,
      score: newScore,
    };

    const { error: fallbackError } = await supabase
      .from("scores")
      .insert([fallbackPayload]);

    if (fallbackError) {
      throw fallbackError;
    }
  }
};
