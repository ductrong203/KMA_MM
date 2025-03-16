const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('khen_thuong_ky_luat', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sinh_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sinh_vien',
        key: 'id'
      }
    },
    danh_muc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'danh_muc_khen_ky_luat',
        key: 'id'
      }
    },
    ngay_quyet_dinh: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    so_quyet_dinh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nguoi_ky: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    ly_do: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    hinh_thuc: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    muc_thuong_phat: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ngay_tao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    nguoi_tao: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    trang_thai: {
      type: DataTypes.TINYINT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'khen_thuong_ky_luat',
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
        name: "sinh_vien_id",
        using: "BTREE",
        fields: [
          { name: "sinh_vien_id" },
        ]
      },
      {
        name: "danh_muc_id",
        using: "BTREE",
        fields: [
          { name: "danh_muc_id" },
        ]
      },
    ]
  });
};
