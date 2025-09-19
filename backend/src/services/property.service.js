const { PropertyNotFound } = require("../errors/property.error");
const Property = require("../models/properties.model")

exports.getByName = async (name) => {
    if(!name) throw new PropertyNotFound();
    const property = await Property.findOne({name}).lean().exec();
    if(!property) throw new PropertyNotFound();
    return property;
}

exports.getCurrencyConfig = async (filter = {})=>{
    const property = await Property.findOne({name : "CURRENCIES_CONFIG", ...filter}).lean();
    return property;
}