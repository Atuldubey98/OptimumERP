const { Schema, Types, model } = require("mongoose");

const quoteSchema = new Schema({
    customer : {
        type : Types.ObjectId,
        required : true,
        ref  :"customer"
    },
    total : {
        type : Number,
        default : 0,
        required : true
    },
    totalTax : {
        type : Number,
        default : 0,
        required : true
    },
    description : {
        type : String,
        default : "Thanks for the business."
    },
    date : {
        type : Date,
        default : new Date(Date.now())
    },
    quoteNo : {
        type : String,
        required :  true,
        unique : true,
    },
    createdBy  :{
        type : Types.ObjectId,
        required : true,
        ref : "user"
    },
    updatedBy : {
        type : Types.ObjectId,
        required : true,
        ref : "user"
    },
    status : {
        type : String,
        default : "draft",
        enum : ["draft","pending", "sent","accepted", "declined"]
    }
},{
    versionKey : true,
    timestamps : true,
})
const Quotes = model("quotes", quoteSchema);

module.exports = Quotes;