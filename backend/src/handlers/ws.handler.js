const sessionHandler = require("./session.handler");
const ai = require("../ai");

function getWsHandlers(wss) {
    const onMessage = async (ws, data, request) => {
        try {
            const body = JSON.parse(data);
            const response = await ai.chat("qwen3.5",{
                messages : [{ role: 'user', content: body.message }],
                org: body.org,
                createdBy: request.session.user._id
            });

            ws.send(JSON.stringify({
                event: "ai_response",
                data: response
            }));
        } catch (error) {
            console.log(error);
            
            ws.send(JSON.stringify({
                event: "error",
                message: "failed to process message"
            }));
        }
    };

    const onClose = () => { };

    const onUpgrade = (request, socket, head) => {
        sessionHandler(request, {}, () => {
            if (!request.session || !request.session.user) {
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }
            wss.handleUpgrade(request, socket, head, (wsInstance) => {
                wss.emit('connection', wsInstance, request);
            });
        });
    };

    return Object.freeze({
        onUpgrade,
        onMessage,
        onClose
    });
}

module.exports = getWsHandlers;