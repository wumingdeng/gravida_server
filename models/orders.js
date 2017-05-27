'use strict';
module.exports = function(sequelize, DataTypes) {
  var orders = sequelize.define('orders', {
    status: DataTypes.INTEGER,
    exp_no:DataTypes.STRING,
    pro_no:DataTypes.STRING,
    pay_t: DataTypes.INTEGER,
    addr_o: DataTypes.STRING,
    addr_a: DataTypes.STRING,
    custom: DataTypes.STRING,
    custom_phone: DataTypes.INTEGER,
    goods_color: DataTypes.INTEGER,
    goods_size: DataTypes.INTEGER,
    goods_count: DataTypes.INTEGER,
    send_t: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        models.orders.hasMany(models.goods,{foreignKey:'id',sourceKey:'pro_no'})
      }
    }
  });
  return orders;
};