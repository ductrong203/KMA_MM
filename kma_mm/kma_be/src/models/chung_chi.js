const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  const ChungChi = sequelize.define('chung_chi', {
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
        model: 'sinh_vien',
        key: 'id',
      },
    },
    diem_trung_binh: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    xep_loai: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    so_quyet_dinh: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ngay_ky_quyet_dinh: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    tinh_trang: {
      type: DataTypes.ENUM('tốt nghiệp', 'bình thường'),
      allowNull: false,
      defaultValue: 'bình thường',
    },
    loai_chung_chi: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    loai_chung_chi_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'loai_chung_chi',
        key: 'id',
      },
      comment: 'Foreign key tới bảng loai_chung_chi',
    },
  }, {
    sequelize,
    tableName: 'chung_chi',
    timestamps: false,
    indexes: [
      {
        name: 'PRIMARY',
        unique: true,
        using: 'BTREE',
        fields: [{ name: 'id' }],
      },
      {
        name: 'sinh_vien_id',
        using: 'BTREE',
        fields: [{ name: 'sinh_vien_id' }],
      },
      {
        name: 'idx_chung_chi_loai_chung_chi_id',
        using: 'BTREE',
        fields: [{ name: 'loai_chung_chi_id' }],
      },
    ],
  });

  // Định nghĩa associations
  ChungChi.associate = function(models) {
    // Mối quan hệ với sinh_vien
    ChungChi.belongsTo(models.sinh_vien, {
      foreignKey: 'sinh_vien_id',
      as: 'sinhVien',
    });

    // Mối quan hệ với loai_chung_chi
    ChungChi.belongsTo(models.loai_chung_chi, {
      foreignKey: 'loai_chung_chi_id',
      as: 'loaiChungChi',
    });
  };

  return ChungChi;
}