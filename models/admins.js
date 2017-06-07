'use strict';
module.exports = function(sequelize, DataTypes) {
  var admins = sequelize.define('admins', {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    familyname: DataTypes.STRING,
    hospital_no: DataTypes.STRING,
    weight: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.admins.hasOne(models.hospitals,{foreignKey:'id',sourceKey:'hospital_no'})
      }
    }
  });
  return admins;
};