const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const adminController = require("../controllers/admin");
const { check } = require("express-validator");

// /admin/fetch-products
router.get("/fetch-products", [isAuth, isAdmin], adminController.fetchProducts);

// /admin/dashboard
router.get("/dashboard", [isAuth, isAdmin], adminController.fetchDashboard);

// /admin/order
router.get("/order", [isAuth, isAdmin], adminController.getOrderDetail);

// /admin/add-product
router.post(
  "/add-product",
  [
    check("name").trim().notEmpty().withMessage("Please input a name"),
    check("category").trim().notEmpty().withMessage("Please input a category"),
    check("longDescription")
      .trim()
      .isLength({ min: 25 })
      .withMessage("Please input a description of at least 25 characters"),
    check("shortDescription")
      .trim()
      .notEmpty()
      .withMessage("Please input a short description"),
    check("price").trim().notEmpty().withMessage("Please input a price"),
    check("inStock")
      .trim()
      .notEmpty()
      .withMessage("Please input the number in stock"),
    check("images").custom((value, { req }) => {
      if (req.files && Object.keys(req.files).length !== 4) {
        throw new Error("Please upload 4 images");
      }
      return true;
    })
  ],
  [isAuth, isAdmin],
  adminController.addNewProduct
);

// /admin/delete-product/prodId
router.get(
  "/delete-product/:prodId",
  [isAuth, isAdmin],
  adminController.deleteProduct
);

// /admin/fetch/prodId
router.get("/fetch/:prodId", [isAuth, isAdmin], adminController.fetchProduct);

// /admin/edit/prodId
router.use(
  "/edit/:prodId",
  [
    check("name").trim().notEmpty().withMessage("Please input a name"),
    check("category").trim().notEmpty().withMessage("Please input a category"),
    check("longDescription")
      .trim()
      .isLength({ min: 25 })
      .withMessage("Please input a description of at least 25 characters"),
    check("shortDescription")
      .trim()
      .notEmpty()
      .withMessage("Please input a short description"),
    check("price").trim().notEmpty().withMessage("Please input a price")
  ],
  [isAuth, isAdmin],
  adminController.editProduct
);

module.exports = router;
