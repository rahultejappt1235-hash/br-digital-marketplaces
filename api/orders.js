const db = require("./_db");

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed"
      });
    }

    const {
      product_id,
      quantity,
      customer_name,
      customer_phone,
      delivery_address
    } = req.body || {};

    if (
      !product_id ||
      !customer_name ||
      !customer_phone ||
      !delivery_address
    ) {
      return res.status(400).json({
        success: false,
        error: "Customer name, phone, address and product are required"
      });
    }

    const qty = Number(quantity || 1);

    const productResult = await db.pool.query(
      `SELECT id, name, price
       FROM products
       WHERE id = $1`,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    const product = productResult.rows[0];
    const total = Number(product.price) * qty;

    const orderResult = await db.pool.query(
      `INSERT INTO orders
       (total_amount, status, payment_status, delivery_address)
       VALUES ($1, 'pending', 'pending', $2)
       RETURNING *`,
      [total, delivery_address]
    );

    const order = orderResult.rows[0];

    await db.pool.query(
      `INSERT INTO order_items
       (order_id, product_id, quantity, price)
       VALUES ($1, $2, $3, $4)`,
      [order.id, product.id, qty, product.price]
    );

    return res.status(201).json({
      success: true,
      message: "COD order successfully placed",
      order: {
        id: order.id,
        product: product.name,
        quantity: qty,
        total_amount: total,
        customer_name,
        customer_phone,
        delivery_address,
        payment_method: "Cash on Delivery",
        status: "pending"
      }
    });

  } catch (error) {
    console.error("Order API Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
