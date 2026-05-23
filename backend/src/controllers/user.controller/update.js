const { z } = require("zod");
const User = require("../../models/user.model");
const userDto = z.object({
  name: z.string().min(3).max(60),
});
const update = async (req, res) => {
  const body = await userDto.parseAsync(req.body);
  await User.findOneAndUpdate(
    {
      _id: req.session.user._id,
    },
    { name: body.name }
  );
  req.session.user = { ...req.session.user, name: body.name };
  return res.status(200).json({
    message: req.t("common:api.user_details_updated"),
  });
};

module.exports = update;
