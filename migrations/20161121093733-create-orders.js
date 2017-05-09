'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('orders', {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.INTEGER
      },
      exp_no: {
        type: Sequelize.STRING
      },
      pro_no: {
        type: Sequelize.STRING
      },
      create_t: {
        type: Sequelize.INTEGER
      },
      pay_t: {
        type: Sequelize.INTEGER
      },
      send_t: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },
    {
      charset: 'utf8' // default: null
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('orders');
  }
};