'use strict';
module.exports = function(sequelize, DataTypes) {
  var products = sequelize.define('products', {
    name:DataTypes.STRING,
    intro: DataTypes.STRING,
    price: DataTypes.INTEGER,
    color:DataTypes.STRING,
    type:DataTypes.STRING,
    smallPic:DataTypes.STRING,
    discount: DataTypes.INTEGER,
    introNum: DataTypes.INTEGER,
    pid:DataTypes.STRING
  },{
    timestamps:false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return products;
};