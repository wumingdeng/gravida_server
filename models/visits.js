'use strict';
module.exports = function(sequelize, DataTypes) {
  var visit = sequelize.define('visits', {
    patient_no: DataTypes.STRING,
    doctor_no: DataTypes.STRING,
    hospital_no: DataTypes.STRING,
    gravida_week: DataTypes.INTEGER,
    content:DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return visit;
};