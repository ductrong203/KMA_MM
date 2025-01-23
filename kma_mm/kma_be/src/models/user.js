"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "1",
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "6",

    },
  });

  User.associate = function (models) {
    // Các quan hệ giữa các bảng có thể khai báo ở đây (nếu có)
  };

  return User;
};
