const admin = (req, res, next) => {
  (req.user && req.user.role === "admin")
    ? next()
    : res.status(403).json({ message: "Error: Admin access only." });
};

module.exports = admin;
