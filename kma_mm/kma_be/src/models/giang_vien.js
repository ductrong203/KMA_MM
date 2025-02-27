const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('giang_vien', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_giang_vien: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ho_ten: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    dia_chi: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    so_dien_thoai: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "1"
    },
    la_giang_vien_moi: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    phong_ban_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'phong_ban',
        key: 'id'
      }
    },
    hoc_ham: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    hoc_vi: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    chuyen_mon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    trang_thai: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    thuoc_khoa: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    gioi_tinh: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    ngay_sinh: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'giang_vien',
    timestamps: false,
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
        name: "phong_ban_id",
        using: "BTREE",
        fields: [
          { name: "phong_ban_id" },
        ]
      },
    ]
  });
};
