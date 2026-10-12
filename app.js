// Core Module
const path = require("path");
const fs = require("fs");
const os = require("os");

// External Module
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const session = require("express-session");
const multer = require("multer");
const MongoDBStore = require("connect-mongodb-session")(session);
const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is required. Set it in the environment or .env file.",
  );
}

if (!SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET is required. Set it in the environment or .env file.",
  );
}

//Local Module
const storeRouter = require("./routes/storeRouter");
const hostRouter = require("./routes/hostRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const { default: mongoose } = require("mongoose");
const seedSampleHomes = require("./data/seedSampleHomes");

const app = express();
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "uploads")
  : path.join(rootDir, "uploads");

try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (err) {
  console.log("Could not create upload dir:", err.message);
}

app.set("view engine", "ejs");
app.set("views", "views");

const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOptions = { storage, fileFilter };

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(express.urlencoded());
app.use(multer(multerOptions).single("photo"));
app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(uploadDir));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  }),
);

app.use((req, res, next) => {
  req.isLoggedIn = Boolean(req.session.isLoggedIn && req.session.user);
  req.user = req.session.user;
  next();
});

app.use(authRouter);
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);

app.use(errorsController.pageNotFound);

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to Mongo");
    await seedSampleHomes();
    console.log("Sample homes are ready");
    app.listen(PORT, () => {
      console.log(`Server running on address http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error while connecting to Mongo: ", err);
  });

module.exports = app;
