const Joi = require("joi");
const User = require("../../models/user.model");
const userDto = Joi.object({
  name: Joi.string().label("Name").min(3).max(60).required(),
});
const update = async (req, res) => {
  const body = await userDto.validateAsync(req.body);
  await User.findOneAndUpdate(
    {
      _id: req.session.user._id,
    },
    { name: body.name }
  );
  req.session.user = { ...req.session.user, name: body.name };
  return res.status(200).json({ message: "User details updated" });
};

module.exports = update;
