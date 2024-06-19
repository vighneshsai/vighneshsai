'use strict';

import { Sequelize as sequelize } from 'sequelize';
import  db from "../db/dbconnections.js";

const appliedLeave = db.define("", {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    startDate: {
        type: sequelize.DATE,
        allowNull: true
    },
    endDate: {
        type: sequelize.DATE,
        allowNull: true
    },
    employeeId: {
        type: sequelize.INTEGER,
    },
    reason: {
        type: sequelize.STRING,
        allowNull: true,
    },
    approval: {
        type: sequelize.ENUM,
        validate: {
            isValidValue: function(value) {
                if (value != 'Waiting' && value != 'Approved' && value != 'Rejected')
                    throw new Error("Invalid Type");
            }
        }
    },
    
}, {
    timestamps: true,
    tableName: 'appliedLeave',
    modelName: 'appliedLeave' // Explicitly specify the model name
});
export default appliedLeave;
