const User = require("../models/user.model");
const bcryptjs = require("bcryptjs");
module.exports = {
  createMockUser: async function () {
    const user = {
      email: "mock-user@gmail.com",
      name: "Mock user",
      password: "12345678",
    };
    const existingUser = await User.findByEmailId(user.email);
    if (existingUser) return existingUser;
    const hashedPassword = await bcryptjs.hash(
      user.password,
      await bcryptjs.genSalt(10)
    );
    const registeredUser = await User.create({
      email : user.email,
      password: hashedPassword,
      name: user.name,
    });
    return registeredUser;
  },
};
