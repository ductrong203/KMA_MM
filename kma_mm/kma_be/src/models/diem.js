const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "diem",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      sinh_vien_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "sinh_vien",
          key: "id",
        },
      },
      thoi_khoa_bieu_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "thoi_khoa_bieu",
          key: "id",
        },
      },
      lan_hoc: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      diem_tp1: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      diem_tp2: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      diem_gk: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      diem_ck: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      diem_he_4: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      diem_chu: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      ngay_cap_nhat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      trang_thai: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      diem_hp: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      diem_ck2: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      diem_he_4_2: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      diem_chu_2: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      diem_hp_2: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      ghi_chu: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "diem",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "sinh_vien_id",
          using: "BTREE",
          fields: [{ name: "sinh_vien_id" }],
        },
        {
          name: "thoi_khoa_bieu_id",
          using: "BTREE",
          fields: [{ name: "thoi_khoa_bieu_id" }],
        },
      ],
    }
  );
};