"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("mon_hoc", "he_dao_tao_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "danh_muc_dao_tao",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("mon_hoc", "he_dao_tao_id");
  },
};
