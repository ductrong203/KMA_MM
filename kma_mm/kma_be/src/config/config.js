const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

// Load .env file từ thư mục gốc (1 cấp trên src)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
module.exports = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "nick1234@",
    database: process.env.DB_DATABASE || "quan_ly_dao_tao2",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: process.env.DB_DIALECT || "mysql",
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
  },
  
};
