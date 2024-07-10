const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    } else {
      return res.status(200).json({ message: "User logged out !" });
    }
  });
};

module.exports = logout;
