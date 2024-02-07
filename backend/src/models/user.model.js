const { Schema, model } = require("mongoose");
class User {
  static findByEmailId(email) {
    return this.findOne({ email });
  }
}
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please enter a valid email address",
      ],
      minlength: 5,
      maxlength: 30,
    },
    password: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);
userSchema.loadClass(User);
const UserModel = model("user", userSchema);
module.exports = UserModel;
