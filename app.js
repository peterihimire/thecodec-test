const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {
  logErrorMiddleware,
  returnError,
} = require("./src/middlewares/error-handler");
const authRoute = require("./src/routes/auth-route");
const db = require("./src/models");
const app = express();
const PORT = 6000;

const corsOptions = {
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"],
  allowedHeaders: ["*"],
  credentials: true,
  optionSuccessStatus: 200,
};

// MIDDLEWARES
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoute);

app.use(logErrorMiddleware);
app.use(returnError);

module.exports = app;
