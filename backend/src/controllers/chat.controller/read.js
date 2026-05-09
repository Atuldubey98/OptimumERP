const Chat = require("../../models/chat.model");
const requestAsyncHandler = require("../../handlers/requestAsync.handler");
const { ChatNotFound } = require("../../errors/chat.error");

const read = requestAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orgId } = req.params;

  const chat = await Chat.findOne({ _id: id, org: orgId });

  if (!chat) {
    throw new ChatNotFound();
  }

  res.status(200).json({
    success: true,
    data: chat,
  });
});

module.exports = read;
