const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const genneralAccessToken = async (payload) => {
  const access_token = jwt.sign(
    {
      ...payload,
    },
    process.env.ACCESS_TOKEN,
    { expiresIn: "30m" }
  );
  return access_token;
};
const genneralRefreshToken = async (payload) => {
  const refresh_token = jwt.sign(
    {
      ...payload,
    },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: "365d",
    }
  );
  return refresh_token;
};
const refreshTokenJwtService = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
      jwt.verify(
        token,
        process.env.REFRESH_TOKEN,
        async function (err, decoded) {
          if (err) {
            resolve({
              status: "ERR",
              message: "the authentication",
            });
          }
          const access_token = await genneralAccessToken({
            id: decoded?.id,
            isAdmin: decoded?.isAdmin,
          });
          resolve({
            status: "OKE",
            Message: "SUCCESS",
            access_token,
          });
        }
      );
    } catch (error) {
      reject(e);
    }
  });
};
module.exports = {
  genneralAccessToken,
  genneralRefreshToken,
  refreshTokenJwtService,
};
