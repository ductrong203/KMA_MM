const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan");
const routes = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const db = require("./models");

const app = express();

app.use(helmet());

// Thiết lập rate limit cho toàn bộ ứng dụng
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 200, // Tối đa 200 requests mỗi 15 phút từ 1 IP
  message: {
    status: "ERR",
    message: "Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút."
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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
