const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

// Load .env file từ thư mục gốc (1 cấp trên src)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_HOST:", process.env.DB_HOST);
module.exports = {
  development: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "secret",
    database: process.env.DB_DATABASE || "quan_ly_dao_tao",
    host: process.env.DB_HOST || "hn-fornix-testing-bigdata-5",
    port: process.env.PORT || "3301",
    dialect: process.env.DB_DIALECT || "mysql",
  },
  test: {
    username: "root",
    password: "secret",
    database: "quan_ly_dao_tao",
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
