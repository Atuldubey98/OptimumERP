const { Schema, Types, model } = require("mongoose");
const userActivatedPlan = new Schema({
  user: {
    type: Types.ObjectId,
    ref: "user",
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    enum: ["free", "gold", "platinum"],
    default: "free",
  },
});

const UserActivatedPlan = model("user_activated_plan", userActivatedPlan);

module.exports = UserActivatedPlan;
