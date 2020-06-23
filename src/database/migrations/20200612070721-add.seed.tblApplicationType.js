'use strict';

const { query } = require("express");

module.exports = {
  up: (queryInterface, Sequelize) => {
    const records = [
      { applicationType: 'XMS', applicationDisplayName: ' Barco Cloud management suite'},
    ];

    return queryInterface.bulkInsert("tblApplicationType", records);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DELETE from tblApplicationType');
  }
};
