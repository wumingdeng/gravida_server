'use strict';
module.exports = function(sequelize, DataTypes) {
  var product_storages = sequelize.define('gravida_product_storages', {
    pid:DataTypes.STRING,
    color:DataTypes.INTEGER,
    size:DataTypes.INTEGER,
    amount: DataTypes.INTEGER
  },{
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return product_storages;
};