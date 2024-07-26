const { UserDuplicate } = require("../errors/user.error");
const UserModel = require("../models/user.model");
const { getHashedString } = require("./hashing.service");

exports.registerUser = async ({ email, password, name }) => {
  const existingUser = await UserModel.findByEmailId(email);
  if (existingUser) throw new UserDuplicate();
  const hashedPassword = await getHashedString(password);
  const registeredUser = await UserModel.create({
    email,
    password: hashedPassword,
    name,
  });
  return registeredUser;
};
