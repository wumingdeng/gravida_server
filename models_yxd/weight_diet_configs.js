'use strict';
module.exports = function(sequelize, DataTypes) {
  var weightAdvice_configs = sequelize.define('weightAdvice_configs', {
    minweek: DataTypes.INTEGER,
    maxweek: DataTypes.INTEGER,
    con_diet:DataTypes.TEXT,
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
  return weightAdvice_configs;
};