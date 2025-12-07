const { Server } = require("socket.io");
const cookie = require("cookie");
const JWT = require("jsonwebtoken");
const userModel = require("../models/user.model");
const messageModel = require("../models/message.model");
const {generateLegalResponse} = require("../services/ai.service");

function initializeSocket(httpServer) {
  const io = new Server(httpServer);

  //Socket Middleware

  io.use(async (socket, next) => {
    //Add Cookie Token in Headers
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) { 
        return next(new Error("Token missing or not set"));
    }
    //JWT Token Verifying
    try {
      const decoded = JWT.verify(cookies.token, process.env.JWT_SECRET);
      console.log("Decoded User ID for DB search:", decoded.id);
      const user = await userModel.findById(decoded.id);

      if (!user) {
        console.error(`User not found for ID: ${userIdToSearch}`);
        return next(new Error("Authentication failed: User not found in database."));
    }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed: " + error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("ai-message", async (messagePayload) => {
      //Save User message in Database
      const message = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user",
      });

      let response;
      try {
        response = await generateLegalResponse(messagePayload.content, messagePayload.fileDetails);
      } catch (aiError) {
        console.error("AI Generation Error:", aiError);
        
        socket.emit("error", { message: "AI service could not generate a response." });
        return; 
      }
      
      // 🚩 Save AI response in Database
      await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id, 
        content: response, 
        role: "model",
      });


      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });
  });
}

module.exports = initializeSocket;
