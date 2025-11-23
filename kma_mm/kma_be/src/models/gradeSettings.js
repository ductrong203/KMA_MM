'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuyDinhDiem extends Model {
    static associate(models) {
      // định nghĩa các mối quan hệ ở đây
    }
  }
  
  QuyDinhDiem.init({
    diemThiToiThieu: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 2.0,
      field: 'diem_thi_toi_thieu'
    },
    diemTrungBinhDat: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 4.0,
      field: 'diem_trung_binh_dat'
    },
    diemGiuaKyToiThieu: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 4.0,
      field: 'diem_giua_ky_toi_thieu'
    },
    diemChuyenCanToiThieu: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 4.0,
      field: 'diem_chuyen_can_toi_thieu'
    },
    chinhSachHienTai: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'moi',
      field: 'chinh_sach_hien_tai'
    },
    chinhSachTuychinh: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'chinh_sach_tuy_chinh'
    }
  }, {
    sequelize,
    modelName: 'QuyDinhDiem',
    tableName: 'quy_dinh_diem',
    underscored: true
  });
  
  return QuyDinhDiem;
};
