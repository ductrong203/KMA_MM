const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const db = require("./models");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
const port = process.env.APPPORT;
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());


// const logActivity = require("./middelWare/logger");
// app.use(logActivity);


routes(app);
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Kết nối với cơ sở dữ liệu đã được thiết lập thành công.");
  })
  .catch((error) => {
    console.error("Không thể kết nối tới cơ sở dữ liệu:", error);
  });

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
