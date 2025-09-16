const propertyService = require("../../services/property.service");
const read = async  (req, res)=>{
    const name = req.params.name;
    const property = await propertyService.getByName(name);
    return res.status(200).json({data : property.value, status : true});
} 

module.exports = read;
