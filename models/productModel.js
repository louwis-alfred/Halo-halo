import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: Array, required: true },
    category: { type: String, required: true },
    harvestDate: { type: Date },
    stock: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    availableForTrade: { type: Boolean, default: false },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
});

const productModel = mongoose.models.Product || mongoose.model('Product', productSchema);
export default productModel;