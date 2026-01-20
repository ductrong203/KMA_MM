const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  const KhoaDaoTao = sequelize.define('khoa_dao_tao', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_khoa: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "ma_khoa"
    },
    ten_khoa: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    nam_hoc: {
      type: DataTypes.STRING(9),
      allowNull: true
    },
    he_dao_tao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'danh_muc_dao_tao',
        key: 'id'
      }
    },
    so_ky_hoc: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    so_ky_hoc_1_nam: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tong_tin_chi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Tổng số tín chỉ thực tế của khóa đào tạo'
    },
    tong_tin_chi_yeu_cau: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 130,
      comment: 'Tổng số tín chỉ yêu cầu để tốt nghiệp của khóa đào tạo'
    }
  }, {
    sequelize,
    tableName: 'khoa_dao_tao',
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
        name: "ma_khoa",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ma_khoa" },
        ]
      },
      {
        name: "he_dao_tao_id",
        using: "BTREE",
        fields: [
          { name: "he_dao_tao_id" },
        ]
      },
    ]
  });

  KhoaDaoTao.associate = function (models) {
    KhoaDaoTao.belongsTo(models.danh_muc_dao_tao, {
      foreignKey: 'he_dao_tao_id',
      as: 'he_dao_tao'
    });
    KhoaDaoTao.hasMany(models.lop, {
      foreignKey: 'khoa_dao_tao_id',
      as: 'lops'
    });
    KhoaDaoTao.hasMany(models.tot_nghiep, {
      foreignKey: 'khoa_dao_tao_id',
      as: 'tot_nghieps'
    });
  };

  return KhoaDaoTao;
};
