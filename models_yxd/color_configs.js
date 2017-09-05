'use strict';
module.exports = function(sequelize, DataTypes) {
  var gravida_color_configs = sequelize.define('gravida_color_configs', {
    index:DataTypes.INTEGER,
    color:DataTypes.STRING,
  },{
    timestamps:false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return gravida_color_configs;
};