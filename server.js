require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const initializeSocket = require('./src/socket/socket.server')
const httpServer = require("http").createServer(app);

const port = process.env.PORT;

connectDB();
initializeSocket(httpServer)
httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});