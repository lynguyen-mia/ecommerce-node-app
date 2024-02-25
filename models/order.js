const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: [
    {
      product: {
        type: Object,
        required: true
      },
      quantity: { type: Number, required: true }
    }
  ],
  user: {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  total: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  status: { type: String, required: true },
  delivery: { type: String, required: true }
});

module.exports = mongoose.model("Order", orderSchema);
