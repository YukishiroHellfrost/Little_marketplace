const { Sequelize } = require('sequelize');
require('dotenv').config();

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Cambia a true si quieres ver las consultas SQL en consola
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Probar la conexión
const connectDB= async () => {
  try {
    await db.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};



module.exports = {db, connectDB};