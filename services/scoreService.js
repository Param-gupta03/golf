import { supabase } from "@/lib/supabaseClient";
import { addScore } from "@/utils/scoreLogic";

export async function addScoreService(userId, score) {
  if (!userId) {
    return { ok: false, error: "userId is required" };
  }

  const parsedScore = Number(score);
  if (Number.isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
    return { ok: false, error: "Score must be between 1 and 45" };
  }

  await addScore(userId, parsedScore);
  const scores = await getScoresService(userId);

  return {
    ok: true,
    data: scores.data,
  };
}

export async function getScoresService(userId) {
  if (!userId) {
    return { ok: false, error: "userId is required", data: [] };
  }

  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message, data: [] };
  }

  return {
    ok: true,
    data: data ?? [],
  };
}

export async function updateScoreService(scoreId, score, playedAt) {
  const parsedScore = Number(score);
  if (!scoreId) {
    return { ok: false, error: "scoreId is required" };
  }

  if (Number.isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
    return { ok: false, error: "Score must be between 1 and 45" };
  }

  const primaryPayload = {
    score: parsedScore,
    played_at: playedAt || new Date().toISOString(),
  };

  let { data, error } = await supabase
    .from("scores")
    .update(primaryPayload)
    .eq("id", scoreId)
    .select()
    .maybeSingle();

  if (error) {
    const fallbackPayload = {
      score: parsedScore,
    };

    const fallbackResult = await supabase
      .from("scores")
      .update(fallbackPayload)
      .eq("id", scoreId)
      .select()
      .maybeSingle();

    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    data,
  };
}
