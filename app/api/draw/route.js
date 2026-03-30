import { runDrawService } from "@/services/drawService";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const result = await runDrawService(body.mode ?? "publish");

  return Response.json(result);
}
