import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, default: false },
});

const investmentModel = mongoose.model('Investment', investmentSchema);

export default investmentModel;