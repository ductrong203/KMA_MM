"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("thong_tin_quan_nhan", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      sinh_vien_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sinh_vien",
          key: "id",
        },
      },
      ngay_nhap_ngu: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      cap_bac: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      trinh_do_van_hoa: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      noi_o_hien_nay: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      don_vi_cu_di_hoc: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      loai_luong: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      nhom_luong: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      bac_luong: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      he_so_luong: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      ngay_nhan_luong: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      chuc_vu: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      suc_khoe: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("thong_tin_quan_nhan");
  },
};
