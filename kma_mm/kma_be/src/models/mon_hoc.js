const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "mon_hoc",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      ma_mon_hoc: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      ten_mon_hoc: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      so_tin_chi: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tinh_diem: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      trang_thai: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 1,
      },

      ghi_chu: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      he_dao_tao_id: {
        // Tách riêng ra khỏi ghi_chu
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "danh_muc_dao_tao",
          key: "id",
        },
      },
      ghi_chu: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "mon_hoc",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
        {
          name: "mon_hoc_he_dao_tao_id_foreign_idx",
          using: "BTREE",
          fields: [{ name: "he_dao_tao_id" }],
        },
      ],
    }
  );
};
