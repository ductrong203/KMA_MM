const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "username"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "1"
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    ho_ten: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    ngay_sinh: {
      type: DataTypes.DATE,
      allowNull: true
    },
    so_dien_thoai: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: "so_dien_thoai"
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: "email"
    },
    dia_chi: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    chuc_vu: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    trang_thai: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "username",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "username" },
        ]
      },
      {
        name: "so_dien_thoai",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "so_dien_thoai" },
        ]
      },
      {
        name: "email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "email" },
        ]
      },
    ]
  });
};
