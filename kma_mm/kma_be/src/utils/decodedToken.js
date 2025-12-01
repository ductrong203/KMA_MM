const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();

// Load .env file từ thư mục gốc (1 cấp trên src)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const SECRET_KEY = process.env.ACCESS_TOKEN;

console.log(SECRET_KEY);

function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // Ví dụ token chứa: { id: "123", role: "admin", ... }
    console.log(decoded)
    return decoded; // { id, role, ... }
  } catch (err) {
    console.error("Invalid or expired token:", err.message);
    return null;
  }
}

module.exports = {verifyAccessToken};
// verifyAccessToken("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZSI6MSwiaWF0IjoxNzU0MzY0MjcyLCJleHAiOjE3NTQzNjYwNzJ9.AhcoU_qjm5Jyl40VLLbTLoB0bxYUd8OvNT6MsH1lryo");
