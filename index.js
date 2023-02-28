const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const {
  logErrorMiddleware,
  returnError,
} = require("./middlewares/error-handler");
const authRoute = require("./routes/auth-route");
const db = require("./models");
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

db.sequelize
  // .sync({ force: true })
  .sync()
  .then(() => {
    app.listen(PORT, function () {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
