const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  const LoaiChungChi = sequelize.define('loai_chung_chi', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    ten_loai_chung_chi: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    xet_tot_nghiep: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Có được xét tốt nghiệp hay không',
    },
    tinh_trang: {
      type: DataTypes.ENUM('hoạt động', 'tạm dừng'),
      allowNull: false,
      defaultValue: 'hoạt động',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    tableName: 'loai_chung_chi',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
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
        name: "idx_loai_chung_chi_ten_loai",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ten_loai_chung_chi" },
        ]
      },
      {
        name: "idx_loai_chung_chi_tinh_trang",
        using: "BTREE",
        fields: [
          { name: "tinh_trang" },
        ]
      },
      {
        name: "idx_loai_chung_chi_xet_tot_nghiep",
        using: "BTREE",
        fields: [
          { name: "xet_tot_nghiep" },
        ]
      },
    ],
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  });

  // Định nghĩa associations
  LoaiChungChi.associate = function(models) {
    // Mối quan hệ với chung_chi
    LoaiChungChi.hasMany(models.chung_chi, {
      foreignKey: 'loai_chung_chi_id',
      as: 'chungChis',
    });
  };

  return LoaiChungChi;
};
