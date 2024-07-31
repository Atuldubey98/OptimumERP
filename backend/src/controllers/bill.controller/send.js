const { isValidObjectId } = require("mongoose");

const send = async (options = {}, req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) throw new NotFound();
  const filter = {
    _id: id,
    org: req.params.orgId,
  };
  
};
