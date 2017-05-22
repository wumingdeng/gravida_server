'use strict';
module.exports = function(sequelize, DataTypes) {
  var hospitals = sequelize.define('hospitals', {
    name: DataTypes.STRING,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return hospitals;
};