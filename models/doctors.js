'use strict';
module.exports = function(sequelize, DataTypes) {
  var doctors = sequelize.define('doctors', {
    name: DataTypes.STRING,
    sex: DataTypes.INTEGER,
    phone:DataTypes.INTEGER,
    hospital_no:DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return doctors;
};