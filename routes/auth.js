const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const authController = require("../controllers/auth");

// CLIENT
router.get("/client/check-session", authController.checkSession);

router.post(
  "/client/login",
  [
    check("email").trim().isEmail().withMessage("Invalid email"),
    check("password")
      .trim()
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must have at least 8 characters")
  ],
  authController.postLogin
);

router.post(
  "/client/register",
  [
    check("email").trim().isEmail().withMessage("Invalid email"),
    check("name").trim().notEmpty().withMessage("Invalid name"),
    check("password")
      .trim()
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must have at least 8 characters"),
    check("phone").trim().notEmpty().withMessage("Invalid phone number")
  ],
  authController.postRegister
);

router.get("/client/logout", authController.logout);

// ADMIN
router.get("/admin/check-session", authController.checkSession);

router.post(
  "/admin/login",
  [
    check("email").trim().isEmail().withMessage("Invalid email"),
    check("password")
      .trim()
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must have at least 8 characters")
  ],
  authController.postAdminLogin
);

router.post(
  "/admin/register",
  [
    check("email").trim().isEmail().withMessage("Invalid email"),
    check("name").trim().notEmpty().withMessage("Invalid name"),
    check("password")
      .trim()
      .isString()
      .isLength({ min: 8 })
      .withMessage("Password must have at least 8 characters"),
    check("phone").trim().notEmpty().withMessage("Invalid phone number"),
    check("role").trim().notEmpty().withMessage("Please choose a role")
  ],
  authController.postAdminRegister
);

router.get("/admin/logout", authController.logout);

module.exports = router;
