const axios = require('axios');

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-2.5-flash';

async function generate(prompt, systemInstruction) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  const url = `${BASE}/models/${MODEL}:generateContent?key=${key}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (systemInstruction) body.systemInstruction = { parts: [{ text: systemInstruction }] };
  const { data } = await axios.post(url, body, { headers: { 'Content-Type': 'application/json' } });
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');
  return text.trim();
}

exports.recommend = async (userContext) => {
  const prompt = `You are an auction recommendation assistant. All amounts in Indian Rupees (Rs). Given: ${JSON.stringify(userContext)}. Respond with exactly 3 lines: Suggested: [item] Rs [price] ([x]% success chance).`;
  return generate(prompt);
};

exports.predictedValue = async (auctionContext) => {
  const prompt = `Auction assistant. Amounts in Rs. Auction: ${JSON.stringify(auctionContext)}. Reply with one sentence: "AI predicted value: Rs X - Rs Y".`;
  return generate(prompt);
};

exports.chat = async (message, auctionContext) => {
  const ctx = auctionContext;
  const sys = `You are a helpful auction assistant for the Bid & Win platform. Answer questions about this specific auction using the details below. Be concise and friendly. All prices are in Indian Rupees (Rs).

Auction details:
- Item: ${ctx.itemName || 'Unknown'}
- Base price: Rs ${ctx.basePrice}
- Current price: Rs ${ctx.currentPrice}
- Status: ${ctx.status}
- Start time: ${ctx.startTime}
- End time: ${ctx.endTime}

Answer any question related to this auction (price, status, timing, bidding tips, etc.). If the question is completely unrelated to auctions or this item, politely say you can only help with auction-related queries.`;
  return generate(message, sys);
};

/**
 * Get recommended bid price in INR based on product, category, base price and past auction history.
 * Returns a number (Rs). Expects Gemini to respond with JSON: { "recommendedPrice": number }.
 */
exports.getRecommendedPrice = async (context) => {
  const prompt = `You are an auction expert. All amounts are in Indian Rupees (Rs).

Given:
- Product: ${context.itemName || 'Unknown'}
- Category: ${context.categoryName || 'General'}
- Base price: Rs ${context.basePrice}
- Past auctions in this category (base → final price): ${JSON.stringify(context.pastAuctions || [])}

Suggest a single recommended bid price (Rs) that a bidder could use as a reference. Consider base price and past outcomes. Return ONLY a JSON object with one key, no other text or markdown. Example: {"recommendedPrice": 1200}`;

  const raw = await generate(prompt);
  let text = raw.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];
  const parsed = JSON.parse(text);
  const value = typeof parsed.recommendedPrice === 'number' ? parsed.recommendedPrice : Number(parsed.recommendedPrice);
  if (Number.isNaN(value) || value < 0) throw new Error('Invalid recommendedPrice from Gemini');
  return Math.round(value);
};
