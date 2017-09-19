'use strict';
module.exports = function(sequelize, DataTypes) {
  var products = sequelize.define('products', {
    gid:DataTypes.INTEGER,
    name:DataTypes.STRING,
    intro: DataTypes.STRING,
    smallPic:DataTypes.STRING,
    swipePic:DataTypes.STRING,
    goods:DataTypes.STRING,
    showType:DataTypes.STRING,
    showPrice:DataTypes.INTEGER,
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