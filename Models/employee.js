// Import Sequelize
import { Sequelize } from 'sequelize';
import db from "../db/dbconnections.js";

const employee = db.define("employee", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    age: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    phoneNumber: {
      type: Sequelize.BIGINT,
      allowNull: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true // Add unique constraint for email
    },
    dob: {
      type: Sequelize.DATE,
      allowNull: true
    },
    appliedLeave: {
      type: Sequelize.DATE,
      allowNull: true
    },
    bloodGroup: {
      type: Sequelize.STRING,
      allowNull: true,
      validate: {
        len: [4] // Ensure blood group is exactly 4 characters long
      }
    },
    personalLeave: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    sickLeave: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
   
    
  }, {
    timestamps: false,
    tableName: 'employee',
    modelName: 'employee' 
});


export default employee;
