const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const authAdminMiddleWare = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: "ERR",
      Message: "Authentication failed. Token is missing.",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        Message: "Authentication failed. Token is invalid.",
      });
    }
    if (decoded.role === 7) {
      next();
    } else {
      return res.status(403).json({
        status: "ERR",
        Message: "Access denied. You do not have the required role.",
      });
    }
  });
};
const authUSerMiddleWare = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: "ERR",
      Message: "Authentication failed. Token is missing.",
    });
  }

  const userId = parseInt(req?.params?.id, 10);
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        Message: "Authentication failed. Token is invalid.",
      });
    }
    if (decoded?.id === userId || decoded?.role === 7) {
      next();
    } else {
      return res.status(403).json({
        status: "ERR",
        Message: "Access denied. You do not have the required role.",
      });
    }
  });
};
const authQuanLyHocVienMiddleWare = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: "ERR",
      Message: "Authentication failed. Token is missing.",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(401).json({
        status: "ERR",
        Message: "Authentication failed. Token is invalid.",
      });
    }
    if (decoded.role === 4) {
      next();
    } else {
      return res.status(403).json({
        status: "ERR",
        Message: "Access denied. You do not have the required role.",
      });
    }
  });
};
module.exports = {
  authAdminMiddleWare,
  authUSerMiddleWare,
  authQuanLyHocVienMiddleWare,
};
