"use strict";

module.exports = {
  up: async (queryInterface, Sequelize)=> {
    return queryInterface.addColumn("activity_logs", "resonse_data", {
      type: Sequelize.TEXT("long"), 
      allowNull: true,

    });
  },
  down: async (queryInterface, Sequelize)=> {
    return queryInterface.removeColumn("activity_logs", "resonse_data");
  }
}
