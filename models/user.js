const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  cart: {
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});

userSchema.methods.addToCart = function (prodId, quantity) {
  const productIndex = this.cart.items.findIndex(
    (p) => p.product.toString() === prodId.toString()
  );
  const updatedCart = [...this.cart.items];
  if (productIndex !== -1) {
    // if product existed in cart, increase quantity
    this.cart.items[productIndex].quantity =
      this.cart.items[productIndex].quantity + quantity;
  } else {
    // if product wasn't in cart, add the product
    updatedCart.push({ product: prodId, quantity: quantity });
  }
  this.cart.items = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter(
    (p) => p.product.toString() !== prodId.toString()
  );
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.editQuantity = function (prodId, quantity) {
  const productIndex = this.cart.items.findIndex(
    (p) => p.product.toString() === prodId.toString()
  );
  const updatedCart = [...this.cart.items];
  if (productIndex !== -1) {
    updatedCart[productIndex].quantity = quantity;
    this.cart.items = updatedCart;
  }
  return this.save();
};

userSchema.methods.clearCart = function (prodId, quantity) {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
