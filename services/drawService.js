import { supabase } from "@/lib/supabaseClient";
import { calculateMatch, generateDraw, getMatchTier } from "@/utils/drawLogic";

function getPrizeForTier(tier, participants) {
  const basePool = Math.max(participants, 1) * 100;

  if (tier === "5-number") return basePool * 0.4;
  if (tier === "4-number") return basePool * 0.35;
  if (tier === "3-number") return basePool * 0.25;
  return 0;
}

async function createDrawRecord(drawNumbers, status, drawMode) {
  const payload = {
    draw_date: new Date().toISOString(),
    numbers: drawNumbers,
    status,
    mode: drawMode,
  };

  let { data, error } = await supabase
    .from("draws")
    .insert([payload])
    .select()
    .maybeSingle();

  if (error) {
    const fallbackPayload = {
      draw_date: payload.draw_date,
      numbers: drawNumbers,
      status,
    };

    const fallbackResult = await supabase
      .from("draws")
      .insert([fallbackPayload])
      .select()
      .maybeSingle();

    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  return { data, error };
}

export async function runDrawService(mode = "publish") {
  const drawNumbers = generateDraw();
  const drawStatus = mode === "simulate" ? "simulation" : "published";
  const { data: drawRecord, error: drawError } = await createDrawRecord(
    drawNumbers,
    drawStatus,
    mode,
  );

  if (drawError) {
    return { ok: false, error: drawError.message };
  }

  const { data: groupedScores, error: scoreError } = await supabase
    .from("scores")
    .select("user_id, score");

  if (scoreError) {
    return { ok: false, error: scoreError.message };
  }

  const byUser = new Map();
  for (const row of groupedScores ?? []) {
    const current = byUser.get(row.user_id) ?? [];
    current.push(row.score);
    byUser.set(row.user_id, current);
  }

  const winners = [];

  for (const [userId, scores] of byUser.entries()) {
    const matchCount = calculateMatch(scores, drawNumbers);
    const tier = getMatchTier(matchCount);

    if (!tier) continue;

    winners.push({
      draw_id: drawRecord?.id,
      user_id: userId,
      match_type: tier,
      prize: getPrizeForTier(tier, byUser.size),
      status: "pending",
    });
  }

  if (mode !== "simulate" && winners.length > 0) {
    const { error: winnerError } = await supabase.from("winners").insert(winners);

    if (winnerError) {
      return { ok: false, error: winnerError.message, draw: drawRecord };
    }
  }

  return {
    ok: true,
    data: {
      draw: drawRecord,
      numbers: drawNumbers,
      mode,
      winnersCreated: winners.length,
      simulatedWinners: winners,
    },
  };
}
