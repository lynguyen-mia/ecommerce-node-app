let io;
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: [
          "https://digital-ecommerce-react.netlify.app",
          "https://admin-ecommerce-react.netlify.app"
        ],
        methods: ["GET, POST, PUT, DELETE, OPTIONS, HEAD"]
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
