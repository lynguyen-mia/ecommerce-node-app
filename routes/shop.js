const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const { check } = require("express-validator");

const shopController = require("../controllers/shop");

router.get("/fetch-products", shopController.fetchProducts);

router.post("/fetch-product", shopController.fetchProduct);

router.get("/detail/:prodId", shopController.fetchProductDetails);

router.get("/fetch-category", shopController.filterCategory);

router.get("/search-product", shopController.searchProduct);

router.post("/add-to-cart", isAuth, shopController.addToCart);

router.get("/cart", isAuth, shopController.getCart);

router.get("/cart-remove", isAuth, shopController.removeFromCart);

router.post("/edit-cart", isAuth, shopController.editQuantity);

router.post(
  "/order",
  [
    check("formData.name")
      .trim()
      .notEmpty()
      .withMessage("Please fill out a name"),
    check("formData.email")
      .trim()
      .isEmail()
      .withMessage("Please fill out a valid email"),
    check("formData.phone")
      .trim()
      .notEmpty()
      .withMessage("Please fill out a phone"),
    check("formData.address")
      .trim()
      .notEmpty()
      .withMessage("Please fill out an address")
  ],
  isAuth,
  shopController.postOrder
);

router.get("/transactions", isAuth, shopController.getTransactions);

router.get("/order", isAuth, shopController.getOrderDetail);

module.exports = router;
