const { Server } = require("socket.io");

function initializeSocket(httpServer) {
    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        console.log("A user connected");
    });
}

module.exports = initializeSocket;