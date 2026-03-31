const planCatalog = {
  monthly: {
    amount: 5000,
    intervalLabel: "Monthly",
  },
  yearly: {
    amount: 50000,
    intervalLabel: "Yearly",
  },
};

const minimumAmountByCurrency = {
  inr: 5000,
};

function getBaseUrl(req) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    req.headers.get("origin") ||
    "http://localhost:3000"
  );
}

export async function POST(req) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return Response.json(
      {
        ok: false,
        error:
          "Missing STRIPE_SECRET_KEY. Add it to your environment before starting checkout.",
      },
      { status: 500 },
    );
  }

  const { userId, email, plan } = await req.json();
  const selectedPlan = planCatalog[plan];
  const currency = (process.env.STRIPE_CURRENCY || "inr").toLowerCase();

  if (!userId || !email || !selectedPlan) {
    return Response.json(
      { ok: false, error: "userId, email, and a valid plan are required." },
      { status: 400 },
    );
  }

  const minimumAmount = minimumAmountByCurrency[currency];
  if (minimumAmount && selectedPlan.amount < minimumAmount) {
    return Response.json(
      {
        ok: false,
        error: `Configured ${plan} amount is too low for Stripe ${currency.toUpperCase()} checkout.`,
      },
      { status: 400 },
    );
  }

  const baseUrl = getBaseUrl(req);
  const successUrl =
    `${baseUrl}/dashboard?checkout=success&plan=${plan}` +
    "&session_id={CHECKOUT_SESSION_ID}";
  const cancelUrl = `${baseUrl}/dashboard?checkout=cancelled`;

  const payload = new URLSearchParams();
  payload.set("mode", "payment");
  payload.set("success_url", successUrl);
  payload.set("cancel_url", cancelUrl);
  payload.set("customer_email", email);
  payload.set("metadata[userId]", userId);
  payload.set("metadata[plan]", plan);
  payload.set("line_items[0][price_data][currency]", currency);
  payload.set(
    "line_items[0][price_data][product_data][name]",
    `Fairway For Good ${selectedPlan.intervalLabel} Subscription`,
  );
  payload.set(
    "line_items[0][price_data][product_data][description]",
    "Golf access, prize draw eligibility, and charity contribution tracking.",
  );
  payload.set(
    "line_items[0][price_data][unit_amount]",
    String(selectedPlan.amount),
  );
  payload.set("line_items[0][quantity]", "1");

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  const data = await stripeResponse.json();

  if (!stripeResponse.ok) {
    return Response.json(
      {
        ok: false,
        error: data?.error?.message || "Unable to create checkout session.",
      },
      { status: stripeResponse.status },
    );
  }

  return Response.json({
    ok: true,
    data: {
      sessionId: data.id,
      url: data.url,
    },
    error: null,
  });
}
