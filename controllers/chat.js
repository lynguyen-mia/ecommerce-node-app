const io = require("../socket");
const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/chat");

// CLIENT
exports.fetchClientRoom = async (req, res, next) => {
  try {
    const roomId = req.query.id;
    // Fetch room list from DB
    const room = await Chat.findOne({ roomId: roomId });

    res.status(200).json({ room: room });
  } catch (err) {
    next(err);
  }
};

exports.fetchRoomId = async (req, res, next) => {
  try {
    let roomId = req.query.id;
    // console.log(roomId);
    if (roomId === "null") {
      // If no room exits, create one
      roomId = uuidv4();
      console.log(roomId);
    }
    res.status(200).json({ roomId: roomId });
  } catch (err) {
    next(err);
  }
};

// ADMIN
exports.fetchRoomList = async (req, res, next) => {
  try {
    // Fetch room list from DB
    const rooms = await Chat.find();
    const firstRoomContent = rooms[0];
    const roomList = rooms.map((r) => r.roomId);
    // console.log(roomList, rooms);
    res.status(200).json({ rooms: roomList, firstRoom: firstRoomContent });
  } catch (err) {
    next(err);
  }
};

exports.fetchAdminRoom = async (req, res, next) => {
  try {
    const roomId = req.query.id;
    // Fetch room list from DB
    const room = await Chat.findOne({ roomId: roomId });

    res.status(200).json({ room: room });
  } catch (err) {
    next(err);
  }
};

exports.searchChatRoom = async (req, res, next) => {
  try {
    const roomId = req.query.id;
    // Fetch room list from DB
    const rooms = await Chat.find({
      roomId: { $regex: roomId, $options: "i" }
    });
    const roomList = rooms.map((r) => r.roomId);

    res.status(200).json({ room: roomList });
  } catch (err) {
    next(err);
  }
};

exports.chatHandler = async (data) => {
  try {
    // console.log(data);
    const roomNum = data.roomId;
    if (!roomNum) {
      return;
    }
    const messageObj = {
      userId: data.user.userId,
      name: data.user.name,
      role: data.user.role,
      content: data.message
    };
    // console.log(roomNum);

    // Check if user wants to end chat
    if (data.message === "/end") {
      // Delete roomId in DB
      await Chat.findOneAndDelete({ roomId: roomNum });
      // Emit event so clients know to delete roomId in local storage
      io.getIO().emit("endChat", {
        roomId: roomNum
      });
      return;
    }

    // Save chat data
    // If room doesn't exist in DB, save chat room data in DB
    const dbChatRoom = await Chat.findOne({ roomId: roomNum });
    // console.log(dbChatRoom);
    if (!dbChatRoom) {
      const newChat = new Chat({
        roomId: roomNum,
        messages: messageObj
      });
      await newChat.save();

      // Emit an event for admin client
      io.getIO().emit("newRoom", { roomId: roomNum });
    } else {
      // If room existed in DB, append message & save to DB
      dbChatRoom.messages = [...dbChatRoom.messages, messageObj];
      await dbChatRoom.save();
    }

    // Emit message data to all clients (shoping & admin sites) when a new chat message is received
    io.getIO().emit("chatRes", {
      roomId: roomNum,
      message: messageObj
    });
  } catch (err) {
    console.log(err);
  }
};
