"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "giang_vien",
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // Thêm autoIncrement cho cột id
        },
        ma_giang_vien: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        ho_ten: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        dia_chi: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        so_dien_thoai: {
          type: Sequelize.STRING(20),
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
        la_giang_vien_moi: {
          type: Sequelize.TINYINT,
          allowNull: true,
        },
        phong_ban_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "phong_ban", // Bảng này phải tồn tại trong cơ sở dữ liệu
            key: "id",
          },
        },
        hoc_ham: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        hoc_vi: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        chuyen_mon: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        trang_thai: {
          type: Sequelize.TINYINT, // Sử dụng TINYINT để lưu trạng thái (0 = đã nghỉ, 1 = còn hoạt động)
          allowNull: true,
        },
        thuoc_khoa: {
          type: Sequelize.TINYINT,
          allowNull: true,
        },
        gioi_tinh: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        ngay_sinh: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
      },
      {
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "phong_ban_id",
            using: "BTREE",
            fields: [{ name: "phong_ban_id" }],
          },
        ],
        timestamps: false, // Điều này giống như trong model của bạn
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("giang_vien");
  },
};
