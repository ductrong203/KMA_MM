"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("sinh_vien", "diem_trung_binh_tich_luy", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0.0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("sinh_vien", "diem_trung_binh_tich_luy");
  },
};