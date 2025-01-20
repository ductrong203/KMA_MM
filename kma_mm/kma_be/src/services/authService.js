const { User } = require("../models"); // Đảm bảo import model đúng cách
const Bcrypt = require("bcrypt");
const { genneralAccessToken, genneralRefreshToken } = require("./jwtService");
const register = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { username, password, confirmPassword, role } = newUser;
    try {
      const checkUser = await User.findOne({ username: username });
      if (checkUser !== null) {
        resolve({
          status: "ERR",
          message:
            "this username has already exited! Please try another username !",
        });
<<<<<<< HEAD
      } else {
        const hash = Bcrypt.hashSync(password, 10);

        const createdUser = await User.create({
          username,
          password: hash,
          //confirmPassword,
        });
        if (createdUser) {
          resolve({
            status: "OK",
            message: "Success!",
            data: createdUser,
          });
        }
=======
      }
      const hash = Bcrypt.hashSync(password, 10);

      const createdUser = await User.create({
        username,
        password: hash,
        //confirmPassword,
      });
      if (createdUser) {
        resolve({
          status: "OK",
          message: "Success!",
          data: createdUser,
        });
>>>>>>> d41713428c37de6bbc25a7b7534d832c56d17b25
      }
    } catch (e) {
      reject(e);
    }
  });
};
const loginUser = (user) => {
  return new Promise(async (resolve, reject) => {
    const { username, password } = user;
    try {
      const checkUser = await User.findOne({ where: { username } });
      if (!checkUser) {
        resolve({
          status: "ERR",
          message: "User not found!",
        });
        return;
      }

      const comparePassword = Bcrypt.compareSync(password, checkUser.password);
      if (!comparePassword) {
        resolve({
          status: "ERR",
          message: "Username or password is incorrect!",
        });
        return;
      }

      const access_token = await genneralAccessToken({
        id: checkUser.id,
        role: checkUser.role,
      });
      const refresh_token = await genneralRefreshToken({
        id: checkUser.id,
        role: checkUser.role,
      });

      resolve({
        status: "OK",
        message: "Login successful!",
        data: checkUser,
        access_token,
        refresh_token,
      });
    } catch (error) {
      reject(error);
    }
  });
};
module.exports = {
  register,
  loginUser,
};
