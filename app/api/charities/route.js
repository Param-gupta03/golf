import { getCharitiesService, saveCharityChoiceService } from "@/services/charityService";

export async function GET() {
  const result = await getCharitiesService();
  return Response.json(result);
}

export async function POST(req) {
  const { userId, charityId, charityPercentage } = await req.json();
  const result = await saveCharityChoiceService(
    userId,
    charityId,
    charityPercentage,
  );

  return Response.json(result);
}
