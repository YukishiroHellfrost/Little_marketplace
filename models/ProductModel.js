// models/ProductModel.js
const { DataTypes, Model } = require('sequelize');
const { db } = require('../config/bd_config');
class Product extends Model {}
 Product.init({
  name: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  sell_price: { type: DataTypes.DECIMAL, allowNull: false },
  sku: { type: DataTypes.STRING, allowNull: false, unique: true },
  unit: { type: DataTypes.STRING, allowNull: false }
}, {
  sequelize: db,
  modelName: 'Product',
  tableName: 'products',
  timestamps: true
});

module.exports = { Product };