const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const { validationResult } = require("express-validator");
const path = require("path");
const ejs = require("ejs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "buns2vin@gmail.com",
    pass: "uscy uurh mdxv dwvc"
  }
});

exports.fetchProducts = async (req, res, next) => {
  try {
    const productArr = await Product.find();
    return res.status(200).json({ data: productArr });
  } catch (err) {
    next(err);
  }
};

exports.fetchProduct = async (req, res, next) => {
  try {
    const prodId = req.body.prodId;
    const product = await Product.findOne({ _id: prodId });
    return res.status(200).json({ data: product });
  } catch (err) {
    next(err);
  }
};

exports.fetchProductDetails = async (req, res, next) => {
  try {
    const prodId = req.params.prodId;
    const product = await Product.findOne({ _id: prodId });
    // Fetch related product
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $nin: product._id }
    });
    return res
      .status(200)
      .json({ data: product, relatedProducts: relatedProducts });
  } catch (err) {
    next(err);
  }
};

exports.filterCategory = async (req, res, next) => {
  try {
    const category = req.query.category.toLowerCase() || "all";
    const page = req.query.page || 1;
    const sort = req.query.sort.toLowerCase();
    const ITEMS_PER_PAGE = req.query.pageItem || 8;

    let query = undefined;
    if (category !== "all") {
      query = { category: category };
    }

    const products = await Product.find(query)
      .sort(sort === "down" ? { price: -1 } : sort === "up" ? { price: 1 } : {})
      .skip(ITEMS_PER_PAGE * (page - 1))
      .limit(ITEMS_PER_PAGE);

    const productNum = await Product.find(query).countDocuments();

    return res.status(200).json({ data: products, productTotal: productNum });
  } catch (err) {
    next(err);
  }
};

exports.searchProduct = async (req, res, next) => {
  try {
    const searchTerms = req.query.search.trim();
    const products = await Product.find({
      name: { $regex: searchTerms, $options: "i" }
    });

    return res.status(200).json({ data: products });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const prodId = req.body.prodId;
    const quantity = req.body.quantity;
    // return if user hasn't logged in
    if (!req.session.isLoggedIn) {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    req.user.addToCart(prodId, quantity);
    return res.status(200).json({ msg: "Product added to cart" });
  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await User.findOne({ _id: req.user._id }).populate(
      "cart.items.product"
    );

    return res.status(200).json({
      data: cart.cart.items,
      user: { name: cart.name, email: cart.email, phone: cart.phone }
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const prodId = req.query.id;
    await req.user.removeFromCart(prodId);
    // Get updated cart
    const updatedCart = await User.findOne({ _id: req.user._id }).populate(
      "cart.items.product"
    );
    const updatedCartProducts = updatedCart.cart.items;
    // console.log(updatedCartProducts);
    return res
      .status(200)
      .json({ data: updatedCartProducts, msg: "Product removed successfully" });
  } catch (err) {
    next(err);
  }
};

exports.editQuantity = async (req, res, next) => {
  try {
    const prodId = req.body.prodId;
    const quantity = req.body.quantity;

    await req.user.editQuantity(prodId, quantity);
    // Get updated cart
    const updatedCart = await User.findOne({ _id: req.user._id }).populate(
      "cart.items.product"
    );
    const updatedCartProducts = updatedCart.cart.items;

    return res
      .status(200)
      .json({ data: updatedCartProducts, msg: "quantity changed" });
  } catch (err) {
    next(err);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    const user = req.body.user;
    const items = req.body.items;
    const formData = req.body.formData;
    const total = +req.body.total;

    // VALIDATION
    const errors = validationResult(req);
    console.log(errors.errors);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors.errors[0]);
    }

    const newOrder = new Order({
      items: items,
      user: {
        userId: user.userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      },
      total: total,
      createdAt: new Date(),
      status: "Processing",
      delivery: "Haven't shipped"
    });
    newOrder.save();

    // Clear cart
    await req.user.clearCart();

    // Send email to user
    const rootDir = path.join(__dirname, "../");
    const ejsFile = await ejs.renderFile(
      rootDir + "views/emails/order-confirmation.ejs",
      {
        formData: formData,
        items: items,
        total: total,
        date: new Date().toLocaleString("en-GB", {
          day: "numeric",
          month: "numeric",
          year: "numeric"
        })
      }
    );

    const mailOption = {
      from: "buns2vin@gmail.com",
      to: formData.email,
      subject: "Order Confirmation",
      html: ejsFile
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // Adjust products' instock numbers
    items.forEach(async (orderedProduct) => {
      // Find corresponding product in product collection and update instock number
      const corProduct = await Product.findOne({
        _id: orderedProduct.product._id
      });

      if (corProduct && corProduct.in_stock >= 1) {
        corProduct.in_stock = corProduct.in_stock - orderedProduct.quantity;
        return corProduct.save();
      }
    });

    return res.status(201).json({ msg: "order created" });
  } catch (err) {
    next(err);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    console.log(req.session.user._id);
    const transactions = await Order.find({
      "user.userId": req.session.user._id
    });

    return res.status(200).json({ data: transactions });
  } catch (err) {
    next(err);
  }
};

exports.getOrderDetail = async (req, res, next) => {
  try {
    const orderId = req.query.id;
    const order = await Order.findOne({
      _id: orderId,
      "user.userId": req.user._id
    });
    return res.status(200).json({ data: order });
  } catch (err) {
    next(err);
  }
};
