'use strict';
module.exports = function(sequelize, DataTypes) {
  var gravida_platforms = sequelize.define('gravida_platforms', {
    name:DataTypes.STRING,
    ip:DataTypes.STRING,
    port:DataTypes.INTEGER,
  },{
    timestamps:false,
    classMethods: {
      associate: function(models) {
      }
    }
  });
  return gravida_platforms;
};