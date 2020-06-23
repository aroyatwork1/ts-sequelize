'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("tblApplicationType", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      applicationType: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      applicationDisplayName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("tblApplicationType");
  }
};
