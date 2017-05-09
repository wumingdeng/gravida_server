'use strict';
module.exports = function(sequelize, DataTypes) {
  var admins = sequelize.define('admins', {
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return admins;
};