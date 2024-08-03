const mongoose = require("mongoose");
class OtpRepository {
  static expireOtpByUserId(userId, type = "forgotPassword") {
    return this.findOneAndUpdate(
      {
        user: userId,
        isVerified: false,
        type,
      },
      { expiresAt: new Date(Date.now()), isVerified: true }
    );
  }
  static generateOtpByUserId(userId, type = "forgotPassword") {
    function generateOTP() {
      let digits = "0123456789";
      let otp = "";
      let len = digits.length;
      const NO_OF_DIGITS = 4;
      for (let i = 0; i < NO_OF_DIGITS; i++)
        otp += digits[Math.floor(Math.random() * len)];
      return otp;
    }
    const otp = generateOTP();
    return this.create({
      user: userId,
      otp,
      type,
    });
  }
}
const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      index: true,
      ref: "user",
      required: true,
    },
    otp: { type: String, required: true },
    type: {
      type: String,
      enum: ["register", "forgotPassword"],
      required: true,
      default: "forgotPassword",
    },
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

otpSchema.loadClass(OtpRepository);
const Otp = mongoose.model("OTP", otpSchema);
module.exports = Otp;
