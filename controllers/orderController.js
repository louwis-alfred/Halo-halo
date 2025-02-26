import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";


// Place a new order
export const placeOrder = async (req, res) => {
  try {
    const { address, items, amount, paymentMethod } = req.body;
    const userId = req.user._id;

    console.log("Placing order for user:", userId);
    console.log("Order items:", items);

    const populatedItems = await Promise.all(
      items.map(async (item) => {
        try {
          const product = await Product.findById(item.productId);
          if (!product) {
            console.warn("Product not found:", item.productId);
            return null;
          }

          if (product.stock < item.quantity) {
            throw new Error(`Not enough stock for product: ${product.name}`);
          }

          product.stock -= item.quantity;
          await product.save();

          return {
            product: product._id, // Save reference to product
            quantity: item.quantity,
          };
        } catch (error) {
          console.error("Error processing item:", item, error);
          return null;
        }
      })
    );

    // Filter out any null items
    const finalItems = populatedItems.filter((i) => i !== null);

    console.log("Populated items:", finalItems);

    // Build the order data
    const orderData = {
      userId,
      address,
      items: finalItems, // Contains product ObjectId references & quantity.
      amount,
      paymentMethod,
      status: "Processing",
      date: Date.now(),
    };

    console.log("Order data:", orderData);

    // Create the new order document
    const newOrder = new Order(orderData);
    await newOrder.save();

    console.log("New order saved:", newOrder);

    res.json({
      success: true,
      message: "Order Placed Successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch orders for the logged-in user
export const userOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Fetching orders for user:", userId);

    // Fetch orders for the logged-in user and populate the product details in items.
    const orders = await Order.find({ userId })
      .sort({ date: -1 })
      .populate({
        path: 'items.product',
        model: 'Product',
        select: 'name description price images category', // Select the fields you want to populate
      });

    console.log("Fetched orders with populated products:", JSON.stringify(orders, null, 2));

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Fetch all orders (admin feature)
export const allOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (admin feature)
export const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    console.log("Updating status for order:", orderId, "to status:", status);

    await Order.findByIdAndUpdate(orderId, { status });
    console.log("Order status updated");

    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};