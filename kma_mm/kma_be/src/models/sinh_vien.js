const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sinh_vien', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ma_sinh_vien: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ngay_sinh: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    gioi_tinh: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    que_quan: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    lop_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'lop',
        key: 'id'
      }
    },
    doi_tuong_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'doi_tuong_quan_ly',
        key: 'id'
      }
    },
    dang_hoc: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ho_dem: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ten: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    so_tai_khoan: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ngan_hang: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    chuc_vu: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    CCCD: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ngay_cap_CCCD: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    noi_cap_CCCD: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ky_nhap_hoc: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ngay_vao_doan: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ngay_vao_dang: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ngay_vao_truong: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    ngay_ra_truong: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tinh_thanh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    quan_huyen: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    phuong_xa_khoi: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    dan_toc: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    ton_giao: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    quoc_tich: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    trung_tuyen_theo_nguyen_vong: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nam_tot_nghiep_PTTH: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    thanh_phan_gia_dinh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    doi_tuong_dao_tao: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    dv_lien_ket_dao_tao: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    so_dien_thoai: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    dien_thoai_gia_dinh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    dien_thoai_CQ: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    khi_can_bao_tin_cho_ai: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    noi_tru: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    ngoai_tru: {
      type: DataTypes.TINYINT,
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
    }
  }, {
    sequelize,
    tableName: 'sinh_vien',
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
        name: "lop_id",
        using: "BTREE",
        fields: [
          { name: "lop_id" },
        ]
      },
      {
        name: "doi_tuong_id",
        using: "BTREE",
        fields: [
          { name: "doi_tuong_id" },
        ]
      },
    ]
  });
};
