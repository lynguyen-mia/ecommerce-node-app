const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  roomId: { type: String, required: true },
  messages: [
    {
      userId: { type: String, required: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
      content: { type: String, required: true }
    }
  ]
});

module.exports = mongoose.model("Chat", chatSchema);
