// const { getIO } = require("../socket");

const Order = require("../models/order");
const User = require("../models/user");
const Product = require("../models/product");
const { validationResult } = require("express-validator");
const deleteImg = require("../utils/delete-image");

exports.fetchProducts = async (req, res, next) => {
  try {
    const productArr = await Product.find();
    return res.status(200).json({ data: productArr });
  } catch (err) {
    console.log(err);
  }
};

exports.fetchDashboard = async (req, res, next) => {
  try {
    // Count clients
    const totalClients = await User.find().countDocuments();
    // Get order-related numbers
    const orderArr = await Order.find();
    const totalOrder = orderArr.length;
    // get total revenue
    const totalRev = orderArr.reduce((acc, order) => acc + order.total, 0);

    // this month's average revenue = this month's revenue / this month's number of orders
    const date = new Date();
    // get first & last day of this month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const thisMonthOrders = await Order.find({
      createdAt: {
        $gte: firstDay,
        $lte: lastDay
      }
    });
    const thisMonthRev = thisMonthOrders.reduce(
      (acc, transaction) => acc + transaction.total,
      0
    );
    const thisMonthAvgRev = thisMonthRev / thisMonthOrders.length;
    // console.log(firstDay, lastDay, thisMonthOrders, thisMonthAvgRev);
    // Get 10 latest transactions
    const latestOrders = await Order.find().sort({ createdAt: -1 }).limit(10);
    // console.log(latestOrders);

    return res.status(200).json({
      clients: totalClients || 0,
      orders: totalOrder || 0,
      earning: totalRev || 0,
      monthEarning: thisMonthAvgRev || 0,
      latestOrders: latestOrders
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getOrderDetail = async (req, res, next) => {
  try {
    const orderId = req.query.id;
    const order = await Order.findOne({
      _id: orderId
    });
    return res.status(200).json({ data: order });
  } catch (err) {
    next(err);
  }
};

exports.addNewProduct = async (req, res, next) => {
  try {
    const name = req.body.name;
    const category = req.body.category;
    const shortDescription = req.body.shortDescription;
    const longDescription = req.body.longDescription;
    const price = req.body.price;
    const images = req.files;
    const inStock = +req.body.inStock;

    // VALIDATION
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors.errors[0]);
    }

    // Create a new post in database
    const newProduct = new Product({
      category: category,
      img1: images[0].path,
      img2: images[1].path,
      img3: images[2].path,
      img4: images[3].path,
      long_desc: longDescription,
      name: name,
      price: price,
      short_desc: shortDescription,
      in_stock: inStock
    });

    await newProduct.save();

    return res.status(201).json({ msg: "Product created" });
  } catch (err) {
    console.log(err);
  }
};

exports.editProduct = async (req, res, next) => {
  try {
    const prodId = req.params.prodId;
    const name = req.body.name;
    const category = req.body.category;
    const shortDescription = req.body.shortDescription;
    const longDescription = req.body.longDescription;
    const price = req.body.price;
    const images = req.files;
    const inStock = req.body.inStock;
    // console.log(images);

    // VALIDATION
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(500).json(errors.errors[0]);
    }

    const product = await Product.findOne({ _id: prodId });
    if (!product) {
      return res.status(500).json({ msg: "Internal error" });
    }
    product.name = name;
    product.category = category;
    product.long_desc = longDescription;
    product.short_desc = shortDescription;
    product.price = price;
    product.in_stock = Number(inStock);
    if (images && Object.keys(images).length > 0) {
      const imgList = [1, 2, 3, 4];
      imgList.forEach((num) => {
        const imgPath = product[`img${num}`];
        // Delete images associated with the post
        if (imgPath) {
          deleteImg(imgPath);
        }
        console.log(images[num - 1]);
        // Add new image
        product[`img${num}`] = images[num - 1].path;
      });
    }
    await product.save();

    return res.status(200).send({ msg: "Product edited" });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const prodId = req.params.prodId;
    // check if product exists
    const product = await Product.findOne({ _id: prodId });
    if (!product) {
      return res.status(500).json({ msg: "No product found." });
    }

    // if product is in any order, don't delete image, otherwise, delete images
    const isProductInOrder = await Order.find({ "items.product._id": prodId });
    if (isProductInOrder.length === 0) {
      // Delete images associated with the post
      const imgList = [1, 2, 3, 4];
      imgList.forEach((num) => {
        const imgPath = product[`img${num}`];
        if (imgPath) {
          deleteImg(imgPath);
        }
      });
    }

    // Delete the post in db
    await Product.deleteOne({ _id: prodId });

    return res.status(200).send({ msg: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

exports.fetchProduct = async (req, res, next) => {
  try {
    const prodId = req.params.prodId;
    const product = await Product.findOne({ _id: prodId });
    if (!product) {
      return res.status(500).send({ msg: "Can't fetch the product" });
    }
    return res.status(200).send({ data: product });
  } catch (err) {
    next(err);
  }
};
