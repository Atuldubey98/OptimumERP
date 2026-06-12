const Chat = require("../../models/chat.model");
const { ChatNotFound } = require("../../errors/chat.error");

const remove = async (req, res) => {
  const { id } = req.params;
  const { orgId } = req.params;

  const chat = await Chat.softDelete({ _id: id, org: orgId });

  if (!chat) {
    throw new ChatNotFound();
  }

  res.status(200).json({
    success: true,
    message: "Conversation deleted successfully.",
  });
};

module.exports = remove;