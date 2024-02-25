const express = require("express");
const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");
const chatController = require("../controllers/chat");
const { check } = require("express-validator");

// CLIENT
// /chat/client/room?id=
router.get("/client/chat/room", chatController.fetchClientRoom);

// /chat/roomid?id=
router.get("/client/chat/roomid", chatController.fetchRoomId);

// ADMIN
// /chat/roomlist
router.get("/admin/chat/roomlist", isAuth, chatController.fetchRoomList);

// /chat/room?id=
router.get("/admin/chat/room", isAuth, chatController.fetchAdminRoom);

// /search/chat?id=
router.get("/admin/search/chat", isAuth, chatController.searchChatRoom);

module.exports = router;
