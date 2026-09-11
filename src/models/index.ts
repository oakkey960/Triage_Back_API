import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Connection for Hospital Database (Legacy Pat)
export const sequelizePPK = new Sequelize(
  process.env.DBPPK_NAME || 'ppkhosp',
  process.env.DBPPK_USER || 'applog',
  process.env.DBPPK_PASS || 'applog',
  {
    host: process.env.DBPPK_HOST || '10.10.20.101',
    port: parseInt(process.env.PORTPPK || '3308', 10),
    dialect: (process.env.DBPPK_DIALECT as any) || 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Connection for App Database (Users & History)
export const sequelizeApp = new Sequelize(
  process.env.DB_NAME || 'AssessER',
  process.env.DB_USER || 'ppkdev',
  process.env.DB_PASS || 'ppkdev10664',
  {
    host: process.env.DB_HOST || '172.16.45.23',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    dialect: (process.env.DB_DIALECT as any) || 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);
