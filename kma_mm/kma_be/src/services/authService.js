const { users } = require("../models");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./jwtService");

const register = async (newUser) => {
  const { username, password, confirmPassword, role, ho_ten } = newUser;
  if (password !== confirmPassword) {
    return {
      status: "ERR",
      message: "Passwords do not match!",
    };
  }
  try {
    const checkUser = await users.findOne({ where: { username } });
    if (checkUser) {
      return {
        status: "ERR",
        message: "This username already exists! Please try another username!",
      };
    }

    const hash = await bcrypt.hash(password, 10);
    const createdUser = await users.create({
      username,
      password: hash,
      role,
      ho_ten,
    });

    return {
      status: "OK",
      message: "Success!",
      data: createdUser,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const loginUser = async (user) => {
  const { username, password } = user;
  try {
    const checkUser = await users.findOne({ where: { username } });
    if (!checkUser) {
      return {
        status: "ERR",
        message: "User not found!",
      };
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
    const checkUser = await users.findOne({ where: { id } });
    if (!checkUser) {
      return {
        status: "ERR",
        message: "User not found!",
      };
    }

    await users.destroy({ where: { id } });
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
    const allUsers = await users.findAll();
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
    const checkUser = await users.findOne({ where: { id } });

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
    const checkUser = await users.findOne({ where: { id } });
    if (!checkUser) {
      return {
        status: "ERR",
        message: "User is not defined!",
      };
    }
    const rowsUpdated = await users.update(data, {
      where: { id },
    });
    if (rowsUpdated[0] === 0) {
      return {
        status: "ERR",
        message: "Failed to update user!",
      };
    }
    const updatedUser = await users.findOne({ where: { id } });

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
    const user = await users.findOne({ where: { id } });
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
    await users.update({ password: hashedPassword }, { where: { id } });
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
