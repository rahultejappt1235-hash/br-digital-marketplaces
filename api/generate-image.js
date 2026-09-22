// Vercel Serverless Function
// /api/generate-image
// Hugging Face AI Image Generator

export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  // Hugging Face API Key
  const apiKey = process.env.HUGGINGFACE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error:
        "HUGGINGFACE_API_KEY Vercel Environment Variables में सेट नहीं है।"
    });
  }

  try {
    // Get product name
    const { productName } = req.body || {};

    const name = String(productName || "").trim();

    if (!name) {
      return res.status(400).json({
        error: "Product Name जरूरी है।"
      });
    }

    // Product image prompt
    const prompt = `
Create a clean professional e-commerce product photo of "${name}".

Realistic marketplace catalog photography,
single product centered in the image,
clean white/light studio background,
soft natural shadow,
sharp details,
premium commercial product photography,
front-facing product,
product clearly visible,
no people,
no hands,
no extra objects,
no text,
no watermark,
no logo added by AI,
square composition,
high quality.

Keep the product recognizable and suitable for an online shopping marketplace.
`;

    // Hugging Face model
    const model =
      "black-forest-labs/FLUX.1-schnell";

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    // Read response
    const contentType =
      response.headers.get("content-type") || "";

    if (!response.ok) {
      let errorMessage =
        `Hugging Face request failed (${response.status})`;

      if (contentType.includes("application/json")) {
        const data = await response.json();

        errorMessage =
          data?.error ||
          data?.message ||
          errorMessage;
      } else {
        const text = await response.text();

        if (text) {
          errorMessage = text;
        }
      }

      return res.status(response.status).json({
        error: String(errorMessage)
      });
    }

    // Hugging Face returns image binary
    const imageBuffer =
      Buffer.from(await response.arrayBuffer());

    if (!imageBuffer || imageBuffer.length === 0) {
      return res.status(502).json({
        error: "Hugging Face response में image नहीं मिली।"
      });
    }

    // Convert image to Base64
    const imageBase64 =
      imageBuffer.toString("base64");

    // Detect image type
    let mimeType = "image/png";

    if (contentType.includes("jpeg") ||
        contentType.includes("jpg")) {
      mimeType = "image/jpeg";
    }

    // Return image
    return res.status(200).json({
      image: imageBase64,
      mimeType: mimeType,
      dataUrl: `data:${mimeType};base64,${imageBase64}`
    });

  } catch (error) {
    console.error("Hugging Face image error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "AI image generate करने में समस्या हुई।"
    });
  }
}
