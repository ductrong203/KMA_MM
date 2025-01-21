const { User } = require("../models"); // Đảm bảo import model đúng cách
const Bcrypt = require("bcrypt");
const { genneralAccessToken, genneralRefreshToken } = require("./jwtService");

// const register = (newUser) => {
//   return new Promise(async (resolve, reject) => {
//     const { username, password, confirmPassword, role } = newUser;
//     try {
//       const checkUser = await User.findOne({ username: username });
//       if (checkUser !== null) {
//         resolve({
//           status: "ERR",
//           message:
//             "this username has already exited! Please try another username !",
//         });

//       } else {
//         const hash = Bcrypt.hashSync(password, 10);

//         const createdUser = await User.create({
//           username,
//           password: hash,
//           //confirmPassword,
//         });
//         if (createdUser) {
//           resolve({
//             status: "OK",
//             message: "Success!",
//             data: createdUser,
//           });
//         }

//       }
//       const hash = Bcrypt.hashSync(password, 10);

//       const createdUser = await User.create({
//         username,
//         password: hash,
//         //confirmPassword,
//       });
//       if (createdUser) {
//         resolve({
//           status: "OK",
//           message: "Success!",
//           data: createdUser,
//         });

//       }
//     } catch (e) {
//       reject(e);
//     }
//   });
// };




//sửa lại  cú pháp sequelize logic findOne
const register = async (newUser) => {
  const { username, password, confirmPassword, role } = newUser;

  // Kiểm tra đầu vào
  if (!username || !password || !confirmPassword) {
    return {
      status: "ERR",
      message: "Missing required fields!",
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "ERR",
      message: "Passwords do not match!",
    };
  }

  try {
    console.log("Checking if username exists...");

    // Sử dụng where để kiểm tra username
    const existingUser = await User.findOne({
      where: { username: username.trim() },
    });

    console.log("Existing user:", existingUser);

    if (existingUser) {
      return {
        status: "ERR",
        message: "This username has already existed! Please try another username!",
      };
    }

    const userRole = role || "6";
    console.log("Role assigned:", userRole);

    // Mã hóa mật khẩu
    const hashedPassword = Bcrypt.hashSync(password.trim(), 10);
    console.log("Password hashed successfully.");

    // Tạo người dùng mới
    const createdUser = await User.create({
      username: username.trim(),
      password: hashedPassword,
      role: userRole,
    });

    console.log("User created:", createdUser);

    return {
      status: "OK",
      message: "User registered successfully!",
      data: {
        id: createdUser.id,
        username: createdUser.username,
        role: createdUser.role,
      },
    };
  } catch (error) {
    console.error("Error during registration:", error);

    return {
      status: "ERR",
      message: "An error occurred during registration.",
      error: error.message,
    };
  }
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
