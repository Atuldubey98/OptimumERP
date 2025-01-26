const { Schema, model } = require("mongoose");
class UserRepository {
  static findByEmailId(email) {
    return this.findOne({ email });
  }
  static findByGoogleId(googleId) {
    return this.findOne({ googleId });
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
      index: true,
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
    },
    active: {
      type: Boolean,
      default: true,
    },
    verifiedEmail: {
      type: Boolean,
      default: false,
      required: true,
    },
    googleId: {
      type: String,
      index: true,
    },
    avatar: {
      type: String,
    },
    attributes: {
      type: {
        googleAccessToken: String,
        googleRefreshToken: String,
        picture: String,
      },
      default: {},
      _id: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    methods: {
      activate: function () {
        this.active = true;
        return this.save();
      },
      deactivate: function () {
        this.active = false;
        return this.save();
      },
    },
  }
);
userSchema.loadClass(UserRepository);
const UserModel = model("user", userSchema);
module.exports = UserModel;
