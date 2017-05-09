'use strict';
module.exports = function(sequelize, DataTypes) {
  var visit = sequelize.define('visits', {
    patienNo: DataTypes.STRING,
    doctorNo: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return visit;
};