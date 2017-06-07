'use strict';
module.exports = function(sequelize, DataTypes) {
  var hospitals = sequelize.define('hospitals', {
    name: DataTypes.STRING,
    host: DataTypes.STRING,
    statue:DataTypes.INTEGER,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.hospitals.belongsTo(models.admins,{foreignKey:'id',targetKey:'hospital_no',sourceKey:'hospital_no'})
      }
    }
  });
  return hospitals;
};