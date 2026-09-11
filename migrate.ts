import { sequelizeApp } from './src/models/index';
import './src/models/app_user';
import './src/models/app_triage_history';

async function migrate() {
  try {
    console.log('Connecting to database...');
    await sequelizeApp.authenticate();
    console.log('Connection established successfully.');
    
    console.log('Syncing models (AppUser, AppTriageHistory)...');
    await sequelizeApp.sync({ alter: true });
    console.log('Database sync complete!');
  } catch (error) {
    console.error('Unable to connect to the database or sync:', error);
  } finally {
    await sequelizeApp.close();
  }
}

migrate();
