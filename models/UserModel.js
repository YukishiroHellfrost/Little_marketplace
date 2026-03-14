// models/UserModel.js
const { DataTypes, Model } = require('sequelize');
const { db } = require('../config/bd_config');
class User extends Model {}
 User.init({
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('SUPERUSER', 'CLIENT', 'SELLER', 'SUPERVISOR'), allowNull: false },
  googleAuth: { type: DataTypes.BOOLEAN, defaultValue: false },
  password: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.BOOLEAN, defaultValue: true },
  storeId: {  
    type: DataTypes.INTEGER,
    allowNull: true, // SUPERUSER puede no tener tienda
    references: { model: 'stores', key: 'id' }
  }
}, {
  sequelize: db,
  modelName: 'User',
  tableName: 'users',
  timestamps: true
});

module.exports = { User };