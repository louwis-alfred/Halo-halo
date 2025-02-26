import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  items: {
    type: [orderItemSchema],
    required: true,  // Ensure items cannot be empty
  },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: 'Order Placed' },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, default: false },
  date: { type: Number, required: true }
});



const orderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default orderModel;