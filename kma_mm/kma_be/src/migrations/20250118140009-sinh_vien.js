"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("sinh_vien", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      ma_sinh_vien: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ngay_sinh: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gioi_tinh: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
      que_quan: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      lop_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "lop",
          key: "id",
        },
      },
      doi_tuong_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "doi_tuong_quan_ly",
          key: "id",
        },
      },
      dang_hoc: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
      ghi_chu: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ho_dem: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ten: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      so_tai_khoan: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ngan_hang: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      chuc_vu: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      CCCD: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ngay_cap_CCCD: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      noi_cap_CCCD: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ky_nhap_hoc: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ngay_vao_doan: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      ngay_vao_dang: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      ngay_vao_truong: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      ngay_ra_truong: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      tinh_thanh: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      quan_huyen: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      phuong_xa_khoi: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      dan_toc: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ton_giao: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      quoc_tich: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      trung_tuyen_theo_nguyen_vong: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      nam_tot_nghiep_PTTH: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      thanh_phan_gia_dinh: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      doi_tuong_dao_tao: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      dv_lien_ket_dao_tao: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      so_dien_thoai: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      dien_thoai_gia_dinh: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      dien_thoai_CQ: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      khi_can_bao_tin_cho_ai: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      noi_tru: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
      ngoai_tru: {
        type: Sequelize.TINYINT,
        allowNull: true,
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: "1",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("sinh_vien");
  },
};
