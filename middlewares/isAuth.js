module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  next();
};
