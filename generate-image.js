export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { productName } = req.body;

    if (!productName) {
      return res.status(400).json({
        error: "Product name required"
      });
    }

    const prompt = `
Create a professional e-commerce product photo for:
"${productName}"

Requirements:
- Product only
- Clean white studio background
- Realistic product photography
- High quality
- Front/three-quarter view
- No people
- No text
- No watermark
- Suitable for an online marketplace
`;

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
          prompt: prompt,
          size: "1024x1024"
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI image generation failed"
      });
    }

    const image = data.data?.[0]?.b64_json;

    if (!image) {
      return res.status(500).json({
        error: "AI image not received"
      });
    }

    res.status(200).json({
      image: image
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
}
