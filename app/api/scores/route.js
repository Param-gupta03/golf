import {
  addScoreService,
  getScoresService,
  updateScoreService,
} from "@/services/scoreService";

export async function POST(req) {
  const { userId, score } = await req.json();

  const result = await addScoreService(userId, score);

  return Response.json(result);
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const result = await getScoresService(userId);

  return Response.json(result);
}

export async function PUT(req) {
  const { scoreId, score, playedAt } = await req.json();
  const result = await updateScoreService(scoreId, score, playedAt);

  return Response.json(result);
}
