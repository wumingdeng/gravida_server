'use strict';
module.exports = function(sequelize, DataTypes) {
  var gravida_desc_configs = sequelize.define('gravida_desc_configs', {
    type:DataTypes.INTEGER,
    index:DataTypes.INTEGER,
    desc:DataTypes.STRING,
  },{
    timestamps:false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return gravida_desc_configs;
};