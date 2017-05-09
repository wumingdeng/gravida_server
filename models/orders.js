'use strict';
module.exports = function(sequelize, DataTypes) {
  var order = sequelize.define('orders', {
    status: DataTypes.INTEGER,
    exp_no:DataTypes.STRING,
    pro_no:DataTypes.STRING,
    create_t: DataTypes.INTEGER,
    pay_t: DataTypes.INTEGER,
    send_t: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return order;
};