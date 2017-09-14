'use strict';
module.exports = function(sequelize, DataTypes) {
  var gravida_storage_configs = sequelize.define('gravida_storage_configs', {
    pid:DataTypes.STRING,
    name:DataTypes.STRING,
    color:DataTypes.STRING,
    size:DataTypes.INTEGER,
    barcode:DataTypes.STRING,
    pictures:DataTypes.STRING,
  },{
    timestamps:false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.gravida_storage_configs.hasMany(models.gravida_product_storages,{foreignKey:'pid',sourceKey:'pid'})
        models.gravida_storage_configs.hasMany(models.gravida_storage_records,{foreignKey:'pid',sourceKey:'pid'})
      }
    }
  });
  return gravida_storage_configs;
};