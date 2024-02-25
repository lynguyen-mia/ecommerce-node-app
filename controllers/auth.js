const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

// CLIENT AUTHENICATION
exports.postRegister = async (req, res, next) => {
  try {
    const { email, name, password, phone } = req.body;

    // VALIDATION
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(401).json(errors);
    }

    // If email exists in db, reject
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(401).json({
        errors: [{ msg: "User already existed. Please choose another email." }]
      });
    }
    // Encrypt password & create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email,
      name: name,
      password: hashedPassword,
      phone: phone,
      role: "customer"
    });
    newUser.save();
    res.status(201).json({ msg: "User created" });
  } catch (err) {
    return next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // VALIDATION
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json(errors);
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res
        .status(401)
        .json({ errors: [{ msg: "Invalid email or password" }] });
    }
    // Check password
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res
        .status(401)
        .json({ errors: [{ msg: "Invalid email or password" }] });
    } else {
      // Save data in session
      req.session.isLoggedIn = true;
      req.session.user = user;
      await req.session.save(); // Save the session

      console.log("auth", req.sessionID);
      return res.status(200).json({
        msg: "Login succeeded",
        userData: { userId: user._id, name: user.name }
      });
    }
  } catch (err) {
    return next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await req.session.destroy();

    return res.status(200).json({ msg: "Session deleted" });
  } catch (err) {
    return next(err);
  }
};

// ADMIN AUTHENTICATION
exports.postAdminRegister = async (req, res, next) => {
  try {
    const { email, name, password, phone, role } = req.body;
    // VALIDATION
    const errors = validationResult(req);
    // console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(401).json(errors);
    }

    // If email exists in db, reject
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(401).json({
        errors: [{ msg: "User already existed. Please choose another email." }]
      });
    }
    // Encrypt password & create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email,
      name: name,
      password: hashedPassword,
      phone: phone,
      role: role
    });
    newUser.save();
    res.status(201).json({ msg: "User created" });
  } catch (err) {
    return next(err);
  }
};

exports.postAdminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // VALIDATION
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json(errors);
    }

    const user = await User.findOne({
      email: email,
      role: { $in: ["admin", "consultant"] }
    });
    if (!user) {
      return res
        .status(401)
        .json({ errors: [{ msg: "Invalid email or password" }] });
    }
    // Check password
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res
        .status(401)
        .json({ errors: [{ msg: "Invalid email or password" }] });
    } else {
      // Save data in session
      req.session.isLoggedIn = true;
      req.session.user = user;
      await req.session.save(); // Save the session

      console.log("auth", req.sessionID);
      return res.status(200).json({
        msg: "Login succeeded",
        adminUserData: { userId: user._id, name: user.name, role: user.role }
      });
    }
  } catch (err) {
    return next(err);
  }
};

exports.checkSession = (req, res, next) => {
  try {
    if (!req.session?.isLoggedIn) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    return res.status(200).end();
  } catch (err) {
    console.log(err);
  }
};
