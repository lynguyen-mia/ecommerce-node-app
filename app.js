const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// File Storage --------------------------------
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// Models --------------------------------------
const User = require("./models/user");
const Chat = require("./models/chat");

// Session ------------------------------------
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);

const MONGO_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@posts.6jzacti.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const admin_store = new MongoDbStore({
  uri: MONGO_URI,
  collection: "admin-sessions"
});

const client_store = new MongoDbStore({
  uri: MONGO_URI,
  collection: "client-sessions"
});

// Routers ------------------------------------
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const shopRoutes = require("./routes/shop");
const chatRoutes = require("./routes/chat");

// Middlewares --------------------------------
app.set("engine", "ejs");
app.set("trust proxy", 1);
app.use(
  cors({
    origin: [
      "https://digital-ecommerce-react.netlify.app",
      "https://admin-ecommerce-react.netlify.app"
    ],
    credentials: true,
    methods: ["GET, POST, PUT, DELETE, OPTIONS, HEAD"],
    allowedHeaders: "Content-Type,Authorization"
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  "/admin",
  session({
    secret: "5dtrhjk6045690674565efe1526097d",
    saveUninitialized: false,
    resave: false,
    store: admin_store,
    cookie: {
      name: "admin-sid",
      path: "/admin",
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 2 // session expires after 2 hours
    }
  })
);

app.use(
  "/client",
  session({
    secret: "a1dd36045690032400d56efe1526097d",
    saveUninitialized: false,
    resave: false,
    store: client_store,
    cookie: {
      name: "client-sid",
      path: "/client",
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 2 // session expires after 2 hours
    }
  })
);

app.use(async (req, res, next) => {
  try {
    if (!req.session?.user) {
      return next();
    }
    // find user in database and attach to each request
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
});
// image's path: 'public/images/...' => must expose 'public' folder to root & target request sent to '/public'
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("images", 4)
);

app.use("/client", shopRoutes);
app.use(chatRoutes);
app.use("/admin", adminRoutes);
app.use(authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  return res.status(500).json({ msg: "Internal error" });
});

const { chatHandler } = require("./controllers/chat");

mongoose
  .connect(MONGO_URI)
  .then(() => {
    const httpServer = app.listen(process.env.PORT || 5000);
    console.log("Server connected");
    const io = require("./socket").init(httpServer);
    io.on("connection", (socket) => {
      // console.log("Client connected");
      socket.on("chat", chatHandler);
    });
  })
  .catch((err) => {
    console.log(err);
  });
