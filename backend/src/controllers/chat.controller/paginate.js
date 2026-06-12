const Chat = require("../../models/chat.model");
const crudService = require("../../services/crud.service");

const paginate = async (req, res) => {
  const { orgId } = req.params;

  const { filter, skip, limit: pageSize, total, totalPages } = await crudService.getPaginationParams({
    query: req.query,
    params: { orgId },
    model: Chat,
  });

  const result = await Chat.find(filter, { messages: { $slice: -1 } })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(pageSize);

  const page = parseInt(req.query.page) || 1;

  return res.status(200).json({
    success: true,
    data: result,
    pagination: {
      total,
      page,
      limit: pageSize,
      totalPages,
    },
  });
};

module.exports = paginate;
