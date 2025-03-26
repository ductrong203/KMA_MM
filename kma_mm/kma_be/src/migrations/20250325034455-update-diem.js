"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("diem", "lan_thi");

    await queryInterface.addColumn("diem", "diem_ck2", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn("diem", "diem_he_4_2", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn("diem", "diem_chu_2", {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
    await queryInterface.addColumn("diem", "diem_hp_2", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("diem", "lan_thi", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.removeColumn("diem", "diem_ck2");
    await queryInterface.removeColumn("diem", "diem_he_4_2");
    await queryInterface.removeColumn("diem", "diem_chu_2");
    await queryInterface.removeColumn("diem", "diem_hp_2");
  },
};
