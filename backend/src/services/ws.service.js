const { WebSocketServer } = require("ws");

const wss = new WebSocketServer({ noServer: true });

module.exports = wss;
