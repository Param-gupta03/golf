const BASE_URL = "/api";

export const api = {
  addScore: async (userId, score) => {
    const res = await fetch(`${BASE_URL}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, score }),
    });
    return res.json();
  },

  getScores: async (userId) => {
    const res = await fetch(`${BASE_URL}/scores?userId=${userId}`);
    return res.json();
  },

  updateScore: async (scoreId, score, playedAt) => {
    const res = await fetch(`${BASE_URL}/scores`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scoreId, score, playedAt }),
    });
    return res.json();
  },

  runDraw: async (mode = "publish") => {
    const res = await fetch(`${BASE_URL}/draw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    return res.json();
  },

  getWinners: async () => {
    const res = await fetch(`${BASE_URL}/winners`);
    return res.json();
  },

  getSubscription: async (userId) => {
    const res = await fetch(`${BASE_URL}/subscription?userId=${userId}`);
    return res.json();
  },

  subscribe: async (userId, plan) => {
    const res = await fetch(`${BASE_URL}/subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, plan }),
    });
    return res.json();
  },

  getCharities: async () => {
    const res = await fetch(`${BASE_URL}/charities`);
    return res.json();
  },

  updateCharityChoice: async (userId, charityId, charityPercentage) => {
    const res = await fetch(`${BASE_URL}/charities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, charityId, charityPercentage }),
    });
    return res.json();
  },

  updateWinner: async (winnerId, updates) => {
    const res = await fetch(`${BASE_URL}/winners`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerId, updates }),
    });
    return res.json();
  },
};
