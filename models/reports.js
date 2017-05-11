'use strict';
module.exports = function(sequelize, DataTypes) {
  var reports = sequelize.define('reports', {
    gravida_no: DataTypes.STRING,
    leg_long_0: DataTypes.INTEGER,
    leg_width_0: DataTypes.INTEGER,
    leg_size_0: DataTypes.INTEGER,
    leg_style_0: DataTypes.INTEGER,
    style_width_0:DataTypes.INTEGER,
    leg_long_1: DataTypes.INTEGER,
    leg_width_1: DataTypes.INTEGER,
    leg_size_1: DataTypes.INTEGER,
    leg_style_1: DataTypes.INTEGER,
    style_width_1:DataTypes.INTEGER,
    leg_judge:DataTypes.STRING,
    leg_health:DataTypes.STRING,
    pro_style:DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return reports;
};