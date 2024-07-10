const currentUser = async (req, res) => res.status(200).json(req.session.user);

module.exports = currentUser;
