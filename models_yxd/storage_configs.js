'use strict';
module.exports = function(sequelize, DataTypes) {
  var storage_configs = sequelize.define('gravida_storage_configs', {
    pid:DataTypes.STRING,
    name:DataTypes.STRING,
    color:DataTypes.STRING,
    size:DataTypes.INTEGER,
    color_place:DataTypes.INTEGER
  },{
    timestamps:false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return storage_configs;
};