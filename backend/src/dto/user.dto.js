const { z } = require("zod");

const registerZod = {
  name: z.string().min(3).max(60).describe("Name"),
  email: z.string().email().min(5).max(30).describe("Email"),
  password: z.string().min(6).max(30).describe("Password"),
  role: z.string().default("user").optional().describe("Role"),
};

const registerUserDto = z.object(registerZod);

const orgUserDto = z.object({
  ...registerZod,
  useAdminSMTP: z.boolean().default(false).optional().describe("Use Admin SMTP"),
});

const loginUserDto = z.object({
  email: z.string().email().min(5).max(30).describe("Email"),
  password: z.string().min(6).max(30).describe("Password"),
});

module.exports = {
  registerUserDto,
  loginUserDto,
  orgUserDto,
};
