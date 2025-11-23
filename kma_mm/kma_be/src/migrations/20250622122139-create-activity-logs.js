module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("activity_logs", {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      Username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Role: {
        type: Sequelize.ENUM("admin", "daoTao", "khaoThi", "giamDoc", "quanLiSinhVien","sinhVien","unknown"),
        allowNull: false
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      endpoint: {
        type: Sequelize.STRING,
        allowNull: false
      },
      request_data: {
        type: Sequelize.JSON
      },
      response_status: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("activity_logs");
  }
};
