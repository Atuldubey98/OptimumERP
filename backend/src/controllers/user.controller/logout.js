const logout = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    } else {
      return res.status(200).json({
        message: req.t("common:api.user_logged_out"),
      });
    }
  });
};

module.exports = logout;
