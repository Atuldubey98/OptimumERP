const { default: mongoose, model } = require("mongoose");

const Schema = require("mongoose").Schema;


const propertiesSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required : true},
  },
  { timestamps: true }
);


const Property = model("properties", propertiesSchema);

module.exports=Property;