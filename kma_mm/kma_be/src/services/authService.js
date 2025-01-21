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

      const isPasswordValid = await bcrypt.compare(password, checkUser.password);
      if (!isPasswordValid) {
        return {
          status: "ERR",
          message: "Username or password is incorrect!",
        };
      }

      const access_token = await generalAccessToken({
        id: checkUser.id,
        role: checkUser.role,
      });
      const refresh_token = await generalRefreshToken({
        id: checkUser.id,
        role: checkUser.role,
      });

      return {
        status: "OK",
        message: "Login successful!",
        data: checkUser,
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const deleteUser = async (id) => {
    try {
      const checkUser = await User.findOne({ where: { id } });
      if (!checkUser) {
        return {
          status: "ERR",
          message: "User not found!",
        };
      }

      await User.destroy({ where: { id } });
      return {
        status: "OK",
        message: "Deleted user successfully!",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };
  const getAllUser = async () => {
    try {
      const allUsers = await User.findAll();
      return {
        status: "OK",
        message: "Users information:",
        data: allUsers,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };
  const getDetailUser = async (id) => {
    try {
      const checkUser = await User.findOne({ where: { id } });

      if (!checkUser) {
        return {
          status: "ERR",
          message: "User is not defined!",
        };
      }

      return {
        status: "OK",
        message: "User information with id:",
        id,
        data: checkUser,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };
  const updateUser = async (id, data) => {
    try {
      const checkUser = await User.findOne({ where: { id } });

      if (!checkUser) {
        return {
          status: "ERR",
          message: "User is not defined!",
        };
      }
      const updatedUser = await User.update(data, {
        where: { id },
        returning: true,
      });
      return {
        status: "OK",
        message: "User is updated!",
        data: updatedUser,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };
  const changePassword = async (id, oldPassword, newPassword) => {
    try {
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return {
          status: "ERR",
          message: "User is not defined!",
        };
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return {
          status: "ERR",
          message: "Old password is incorrect!",
        };
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await User.update({ password: hashedPassword }, { where: { id } });
      return {
        status: "OK",
        message: "Password has been changed successfully!",
      };
    } catch (error) {
      throw new Error(error.message);
    }
  };
  module.exports = {
    register,
    loginUser,
    deleteUser,
    getAllUser,
    getDetailUser,
    updateUser,
    changePassword,
  };
