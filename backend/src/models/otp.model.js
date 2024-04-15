const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      index: true,
      ref: "user",
      required: true,
    },
    otp: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      expires: 10 * 60 * 60,
      default: Date.now,
    },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Otp = mongoose.model("OTP", otpSchema);
module.exports = Otp;
