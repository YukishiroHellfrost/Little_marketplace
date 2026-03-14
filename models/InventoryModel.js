// models/InventoryModel.js
const { DataTypes, Model } = require('sequelize');
const { db } = require('../config/bd_config');
class Inventory extends Model {}
Inventory.init({
  storeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'stores', key: 'id' }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' }
  },
  stock: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize: db,
  modelName: 'Inventory',
  tableName: 'inventories',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['storeId', 'productId'] } // Evita duplicados
  ]
});

module.exports = { Inventory };