'use strict';
module.exports = function(sequelize, DataTypes) {
  var goods = sequelize.define('goods', {
    info:DataTypes.STRING,
    price: DataTypes.INTEGER,
    discount: DataTypes.INTEGER,
    icon:DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        
      }
    }
  });
  return goods;
};