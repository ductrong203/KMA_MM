const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "lop",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      autoIncrement: true,
        primaryKey: true,
        autoIncrement: true,
      },
      ma_lop: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      danh_muc_dao_tao_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "danh_muc_dao_tao",
          key: "id",
        },
      },
      trang_thai: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "lop",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "danh_muc_dao_tao_id",
          using: "BTREE",
          fields: [{ name: "danh_muc_dao_tao_id" }],
        },
      ],
    }
  );
};
