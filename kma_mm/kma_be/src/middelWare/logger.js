const { activity_logs } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { users } = require("../models");

const logActivity = async (req, res, next) => {
  const start = Date.now();

  const token = req.headers.authorization?.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    async function getInforByUserID(username) {
      try {
        const user = await users.findOne({ where: { username: username } });
        if (!user) {
          console.log("User not found");
          return null;
        }
        // console.log("Username:", user.username);
        return [user.id, user.role];
      } catch (error) {
        console.error("Database error:", error);
        return null;
      }
    }

    async function getInforByUsername(userId) {
      try {
        const user = await users.findOne({ where: { id: userId } });
        if (!user) {
          console.log("User not found");
          return null;
        }

        // console.log("Username:", user.username);
        return user.username;
      } catch (error) {
        console.error("Database error:", error);
        return null;
      }
    }
    //  getUsernameById(decoded?.id);      
    const mapRole = {
      1: "daoTao",
      2: "khaoThi",
      3: "quanLiSinhVien",
      5: "giamDoc",
      6: "sinhVien",
      7: "admin"

    }
    
    const originalSend = res.send;
    let responseBody;
    
    res.send = function (body) {
      responseBody = JSON.parse(body);
      return originalSend.call(this, body);
    }

    res.on("finish", async () => {
      try {

        if (req.method !== "GET" && req.path !== "/login" && res.statusCode < 400 && responseBody.status !== "ERR") {
          // console.log(req.body.password);
          delete req.body.password;
          delete req.body.confirmPassword;


          console.log("res#################", responseBody.message);
          await activity_logs.create({
            Username: await getInforByUsername(decoded?.id) || "unknown",
            Role: mapRole[decoded?.role] || "unknown",
            action: `${req.method} : ${req.path}`,
            endpoint: req.originalUrl,
            request_data: req.body,
            response_status: res.statusCode,
            resonse_data: responseBody.message || responseBody.thongBao || responseBody.data.message,
            ip_address: req.ip || req.connection.remoteAddress
          })
        }
      } catch (error) {
        console.error("Logging Error:", error);
      }
    });
  })

  next();
}

module.exports = logActivity;
