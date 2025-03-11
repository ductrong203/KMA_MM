"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("diem", "lan_thi");
    await queryInterface.renameColumn("diem", "diem_ck", "diem_ck_1");
    await queryInterface.addColumn("diem", "diem_ck_2", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.renameColumn("diem", "diem_hp", "diem_hp_1");
    await queryInterface.addColumn("diem", "diem_hp_2", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.renameColumn("diem", "diem_he_4", "diem_he_4_1");
    await queryInterface.addColumn("diem", "diem_he_4_2", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.renameColumn("diem", "diem_chu", "diem_chu_1");
    await queryInterface.addColumn("diem", "diem_chu_2", {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("diem", "lan_thi", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.renameColumn("diem", "diem_ck_1", "diem_ck");
    await queryInterface.removeColumn("diem", "diem_ck_2");
    await queryInterface.renameColumn("diem", "diem_hp_1", "diem_hp");
    await queryInterface.removeColumn("diem", "diem_hp_2");
    await queryInterface.renameColumn("diem", "diem_he_4_1", "diem_he_4");
    await queryInterface.removeColumn("diem", "diem_he_4_2");
    await queryInterface.renameColumn("diem", "diem_chu_1", "diem_chu");
    await queryInterface.removeColumn("diem", "diem_chu_2");
  },
};
