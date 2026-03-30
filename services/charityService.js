import { supabase } from "@/lib/supabaseClient";
import { getUserService, upsertUserProfileService } from "@/services/userService";

export async function getCharitiesService() {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return { ok: false, error: error.message, data: [] };
  }

  return { ok: true, data: data ?? [] };
}

export async function saveCharityChoiceService(userId, charityId, charityPercentage) {
  if (!userId || !charityId) {
    return { ok: false, error: "userId and charityId are required" };
  }

  const parsedPercentage = Math.max(10, Number(charityPercentage || 10));
  const currentUser = await getUserService(userId);

  const payload = {
    id: userId,
    charity_id: charityId,
    charity_percentage: parsedPercentage,
    email: currentUser.data?.email,
    role: currentUser.data?.role ?? "subscriber",
  };

  return upsertUserProfileService(payload);
}
