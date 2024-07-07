const mongoose = require("mongoose");
class OtpRepository {
  static expireOtpByUserId(userId) {
    return this.findOneAndUpdate(
      {
        user: userId,
        isVerified: false,
      },
      { expiresAt: new Date(Date.now()), isVerified: true }
    );
  }
  static generateOtpByUserId(userId) {
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
