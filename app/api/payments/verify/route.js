import { supabase } from "@/lib/supabaseClient";

const renewalDays = {
  monthly: 30,
  yearly: 365,
};

function addDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function GET(req) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return Response.json(
      {
        ok: false,
        error:
          "Missing STRIPE_SECRET_KEY. Add it to your environment before verifying checkout.",
      },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const userId = searchParams.get("userId");
  const plan = searchParams.get("plan");

  if (!sessionId || !userId || !renewalDays[plan]) {
    return Response.json(
      { ok: false, error: "sessionId, userId, and a valid plan are required." },
      { status: 400 },
    );
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  const session = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return Response.json(
      {
        ok: false,
        error: session?.error?.message || "Unable to verify checkout session.",
      },
      { status: stripeResponse.status },
    );
  }

  if (
    session.payment_status !== "paid" ||
    session.metadata?.userId !== userId ||
    session.metadata?.plan !== plan
  ) {
    return Response.json(
      {
        ok: false,
        error: "Payment has not been confirmed for this user and plan.",
      },
      { status: 400 },
    );
  }

  const renewalDate = addDays(renewalDays[plan]);
  const existingSubscription = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let subscriptionResult;

  if (existingSubscription.data?.id) {
    subscriptionResult = await supabase
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        renewal_date: renewalDate,
      })
      .eq("id", existingSubscription.data.id)
      .select()
      .maybeSingle();
  } else {
    subscriptionResult = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: userId,
          plan,
          status: "active",
          renewal_date: renewalDate,
        },
      ])
      .select()
      .maybeSingle();
  }

  await supabase
    .from("users")
    .update({ subscription_status: "active" })
    .eq("id", userId);

  return Response.json({
    ok: !subscriptionResult.error,
    data: {
      sessionId,
      subscription: subscriptionResult.data,
    },
    error: subscriptionResult.error?.message ?? null,
  });
}
