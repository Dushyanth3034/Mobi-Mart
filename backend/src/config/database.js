const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '../../.env') });

const dbName = process.env.DB_NAME || 'Mobi_Mart';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? false : false,
  dialectOptions: process.env.DB_SSL === 'true'
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] MySQL Connection established successfully to "${dbName}" at ${dbHost}:${dbPort}`);
  } catch (error) {
    console.error('[Database] Unable to connect to MySQL database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, testConnection };
