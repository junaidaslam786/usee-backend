import 'dotenv/config';
import path from 'path'

const {
  DB_HOST, DB_PORT = 5432, DB_NAME, DB_USER, DB_PASSWORD,
} = process.env;

const defaultConfig = {
  dialect: 'postgres',
  timezone: '+03:00',
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: DB_HOST,
  port: Number(DB_PORT),
  define: {
    underscored: true,
    raw: true
  },
  seederStorage: 'sequelize',
  migrationStorage: 'sequelize',
  seederStorageTableName: 'system_seeds',
  migrationStorageTableName: 'system_migrations',

  seedersPath: path.resolve(__dirname, '../database/seeders'),
};

export const development = {
  ...defaultConfig,
};

export const test = {
  ...defaultConfig,
  logging: false,
};

export const production = {
  ...defaultConfig,
  logging: false,
};
