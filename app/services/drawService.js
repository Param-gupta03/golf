import { supabase } from "@/lib/supabaseClient";
import { generateDraw, calculateMatch } from "@/utils/drawLogic";

export const runDrawService = async () => {
  const drawNumbers = generateDraw();

  // Save draw
  const { data: draw } = await supabase
    .from("draws")
    .insert([{ numbers: drawNumbers, status: "completed" }])
    .select()
    .single();

  // Get all users
  const { data: users } = await supabase.from("users").select("*");

  for (let user of users) {
    const { data: scores } = await supabase
      .from("scores")
      .select("score")
      .eq("user_id", user.id);

    const userScores = scores.map((s) => s.score);

    const matchCount = calculateMatch(userScores, drawNumbers);

    if (matchCount >= 3) {
      let matchType =
        matchCount === 5
          ? "5-match"
          : matchCount === 4
          ? "4-match"
          : "3-match";

      await supabase.from("winners").insert([
        {
          user_id: user.id,
          draw_id: draw.id,
          match_type: matchType,
          prize: 0, // will calculate later
        },
      ]);
    }
  }

  return { drawNumbers };
};