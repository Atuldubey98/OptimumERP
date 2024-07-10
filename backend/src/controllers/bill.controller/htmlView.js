const { isValidObjectId } = require("mongoose");
const { getBillDetail } = require("../../helpers/bill.helper");

const htmlView = async (options = {}, req, res) => {
  const { NotFound, Bill } = options;
  try {
    const id = req.params.id;
    if (!isValidObjectId(id)) throw new NotFound();
    const filter = {
      _id: id,
      org: req.params.orgId,
    };
    const template = req.query.template || "simple";
    const locationTemplate = `templates/${template}`;
    const data = await getBillDetail({
      Bill,
      filter,
      NotFound: NotFound,
    });
    return res.render(locationTemplate, data);
  } catch (error) {
    return res.render(`templates/error`);
  }
};

module.exports = htmlView;
