import { supabase } from "@/lib/supabaseClient";

export const calculatePrizes = async (drawId, totalPool) => {
  const distribution = {
    "5-match": totalPool * 0.4,
    "4-match": totalPool * 0.35,
    "3-match": totalPool * 0.25,
  };

  for (let type of ["5-match", "4-match", "3-match"]) {
    const { data: winners } = await supabase
      .from("winners")
      .select("*")
      .eq("draw_id", drawId)
      .eq("match_type", type);

    if (winners.length > 0) {
      const splitPrize = distribution[type] / winners.length;

      for (let winner of winners) {
        await supabase
          .from("winners")
          .update({ prize: splitPrize })
          .eq("id", winner.id);
      }
    }
  }
};