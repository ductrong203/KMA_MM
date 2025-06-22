const { activity_logs } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { users } = require("../models");

const logActivity = async (req,res,next) => {
  const start = Date.now();
  
  const token = req.headers.authorization?.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
     async function getInforByUserID(username) {
      try {
        const user = await users.findOne({ where: { username: username  } });
        
        if (!user) {
          console.log("User not found");
          return null;
        }
        
        // console.log("Username:", user.username);
        return [user.id, user.role];
      } catch (error) {
        console.error("Database error:", error);
        return null;
      }}
      
     async function getInforByUsername(userId) {
      try {
        const user = await users.findOne({ where: { id: userId  } });
        
        if (!user) {
          console.log("User not found");
          return null;
        }
        
        // console.log("Username:", user.username);
        return user.username;
      } catch (error) {
        console.error("Database error:", error);
        return null;
      }}      
    //  getUsernameById(decoded?.id);      
      const mapRole = {
        1 : "daoTao",
        2 : "khaoThi",
        3 : "quanLiSinhVien",
        5 : "giamDoc",
        6 : "sinhVien",  
        7 : "admin"
        
      }

      res.on("finish", async () => {
        // const duration = Date.now() - start;
        // console.log(req);
        try {

          //xử lí lấy user login
        //   console.log("check test: ", decoded?.id);
        //   console.log("xin chao ban: ", await getInforByUsername(decoded?.id));
        //   if (req.method == "POST" && req.path == "/login") {
        //     let [actorId, actorRole] = await getInforByUserID(req.body.username);
        //     console.log("res: ", res)
        //     await activity_logs.create({
        //       Username: req.body.username || 0,
        //       Role: mapRole[actorRole] || "unknown",
        //       action: `${req.method} : ${req.path}`,
        //       endpoint: req.originalUrl,
        //       request_data: `username : ${req.body.username}`,
        //       response_status: res.statusCode,
        //       ip_address: req.ip || req.connection.remoteAddress
        //     });
        //   }
        //  else 
        
         if (req.method !== "GET" && req.path!=="/login" && res.statusCode < 400) {
            // console.log(req.body.password);
            console.log(res);
            
            delete req.body.password;
            delete req.body.confirmPassword;

            await activity_logs.create({
              Username: await getInforByUsername(decoded?.id) || "unknown",
              Role: mapRole[decoded?.role] || "unknown",
              action: `${req.method} : ${req.path}`,
              endpoint: req.originalUrl,
              request_data: req.body,
              response_status: res.statusCode,
              ip_address: req.ip || req.connection.remoteAddress
            });
          }
          } catch (error) {
          console.error("Logging Error:", error);
        }
      });
    })
    
    next();
}

module.exports = logActivity;