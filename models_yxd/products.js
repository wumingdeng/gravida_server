'use strict';
module.exports = function(sequelize, DataTypes) {
  var products = sequelize.define('products', {
    gid:DataTypes.INTEGER,
    name:DataTypes.STRING,
    intro: DataTypes.STRING,
    smallPic:DataTypes.STRING,
    introNum: DataTypes.INTEGER,
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