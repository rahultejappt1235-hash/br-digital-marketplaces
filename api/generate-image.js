export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { productName } = req.body;

    if (!productName) {
      return res.status(400).json({
        error: "Product name required"
      });
    }

    const prompt = `
Create a professional e-commerce product image for:
"${productName}"

Requirements:
- Clean white studio background
- Product clearly visible
- Realistic product photography
- Centered product
- High quality
- Suitable for an online marketplace
- No people
- No watermark
- No extra text
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
          model: "gpt-image-1",
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
        error: "AI image data नहीं मिली"
      });
    }

    return res.status(200).json({
      image: image
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
