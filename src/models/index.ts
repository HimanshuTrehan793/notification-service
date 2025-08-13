// File: notification-lambda/src/models/index.ts

import { Sequelize } from "sequelize";
import { User } from "./user.model";
import { UserDevice } from "./userDevice.model";

// The Lambda will get its connection string from an environment variable.
// This is simpler and more secure for a serverless environment.
const connectionString = process.env.DB_URI;

if (!connectionString) {
  throw new Error("DB_URI environment variable is not set.");
}

const sequelize = new Sequelize(connectionString, {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 2, 
    min: 0,
    acquire: 20000,
    idle: 10000,
  },
});

// Initialize only the models the Lambda needs
User.initModel(sequelize);
UserDevice.initModel(sequelize);

// Set up only the associations the Lambda needs
User.associate();
UserDevice.associate();

// Export the db object for the handler to use
export const db = {
  sequelize,
  User,
  UserDevice,
};
