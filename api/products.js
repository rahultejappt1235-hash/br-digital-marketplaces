const db = require("./_db");

module.exports = async function handler(req, res) {
  try {
    // GET: सभी products
    if (req.method === "GET") {
      const result = await db.query(`
        SELECT *
        FROM products
        ORDER BY created_at DESC
      `);

      return res.status(200).json({
        success: true,
        products: result.rows
      });
    }

    // POST: नया product add करना
    if (req.method === "POST") {
      const {
        name,
        description,
        price,
        image_url,
        category
      } = req.body || {};

      if (!name || !description || !price || !image_url || !category) {
        return res.status(400).json({
          success: false,
          error: "All product fields are required"
        });
      }

      const result = await db.query(
        `
        INSERT INTO products
        (name, description, price, image_url, category)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
        [
          name,
          description,
          Number(price),
          image_url,
          category
        ]
      );

      return res.status(201).json({
        success: true,
        product: result.rows[0]
      });
    }

    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });

  } catch (error) {
    console.error("Products API Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
