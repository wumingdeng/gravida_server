'use strict';
module.exports = function(sequelize, DataTypes) {
  var weight_diet_configs = sequelize.define('weight_diet_configs', {
    minweek: DataTypes.INTEGER,
    maxweek: DataTypes.INTEGER,
    type:DataTypes.INTEGER,
    con_sug:DataTypes.TEXT  
  }, {
    timestamps:false,
  },{
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return weight_diet_configs;
};