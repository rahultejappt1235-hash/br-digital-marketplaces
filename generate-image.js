// Vercel Serverless Function: /api/generate-image
// Requires OPENAI_API_KEY in Vercel Environment Variables.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY Vercel Environment Variables में सेट नहीं है।"
    });
  }

  try {
    const { productName } = req.body || {};
    const name = String(productName || "").trim();

    if (!name) {
      return res.status(400).json({ error: "Product Name जरूरी है।" });
    }

    const prompt = `Create a clean professional e-commerce product photo for "${name}".
Use a realistic studio setup, centered product, clean light background, soft natural shadow,
sharp details, premium marketplace catalog style, no extra text, no watermark, no people.
Keep the product recognizable and do not invent a different brand or model.`;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const msg =
        data?.error?.message ||
        data?.error ||
        `OpenAI request failed (${response.status})`;
      return res.status(response.status).json({ error: String(msg) });
    }

    const image = data?.data?.[0]?.b64_json;
    if (!image) {
      return res.status(502).json({ error: "OpenAI response में image नहीं मिली।" });
    }

    return res.status(200).json({ image });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "AI image generate करने में समस्या हुई।"
    });
  }
}
