import employeeDbModel from "../Models/employee.js"
import { Op } from 'sequelize';
import db from '../db/dbconnections.js'

const EMPLOYEE_DETAILS = `SELECT AL.STARTDATE,AL.ENDDATE, AL.REASON, AL.APPROVAL
    FROM appliedLeave AL 
    INNER JOIN employee E ON AL.EMPLOYEEID = E.ID WHERE `

const APPLY_LEAVE = "INSERT INTO appliedLeave (startDate, endDate, employeeId, reason)  VALUES (:startDate, :endDate, :id, :reason)";

function formatDate(dateString) {
    // Parse the date string
    const date = new Date(dateString);
    
    // Define an array of month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Extract day, month, and year
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    // Format the date as "DD MMM YYYY"
    return `${day} ${month} ${year}`;
    }    

export const getAllEmployees = (req, res) => {
    return employeeDbModel.findAll({})
        .then((employees) => {
            if (!employees) {
                res.status(404).send();
            } else {
                res.send(employees);
            }
        })
        .catch((err) => {
            res.status(500).send(err);
        });
}

export const getEmployeeAppliedLeave = (req, res) => {
    try {
        const { phoneNumber, email, id } = req.body;
        let whereClause = '';
  
      // Add conditions only if the respective variables are defined
      if (id) {
          whereClause = `E.ID = ${id}`;
        } else if (phoneNumber) {
          whereClause = `E.phoneNumber = '${phoneNumber}'`;
        } else if (email) {
          whereClause = `E.email = '${email}'`;
        } else {
          throw new Error('At least one of id, phoneNumber, or email must be provided');
        }
  
      var employeeQuery = EMPLOYEE_DETAILS + whereClause;
    
      db.query(employeeQuery,{
          type: db.QueryTypes.SELECT
      }).then((data)=> {
         var response = []
         for(var i = 0; i < data.length; i ++) {
          console.log(data[i].STARTDATE)
          var resObj = {}
          resObj.date = data[i].STARTDATE == data[i].ENDDATE ? formatDate(data[i].STARTDATE) : `${formatDate(data[i].STARTDATE)} - ${formatDate(data[i].ENDDATE)}`
          resObj.reason = data[i].REASON
          resObj.approval = data[i].APPROVAL
          response.push(resObj)
  
         }
          res
          .status(200)
          .send({ status: "success", response });
        })
        
      } catch (error) {
        res.status(400).send({ message: "something went wrong", error });
      }
    
}
export const getEmployeeAvailableLeave = (req, res) => {
const personalLeave = 12
const sickLeave = 8
try {
  const { phoneNumber, email, id } = req.body;
 let conditions = [];

// Add conditions only if the respective variables are defined
if (id !== undefined) {
  conditions.push({ id: id });
}
if (phoneNumber !== undefined) {
  conditions.push({ phoneNumber: phoneNumber });
}
if (email !== undefined) {
  conditions.push({ email: email });
}
 employeeDbModel.findOne({
    where: {
        [Op.or]: conditions
     
    },
  }).then((data)=> {
    var availableLeave = personalLeave - data.personalLeave
    var availableSickLeave = sickLeave - data.sickLeave
    var response = {
        availableLeave,
        availableSickLeave
    }
    res.status(200).send({  status: "success", response });

  }) 
  } catch (error) {
    res.status(400).send({ message: "something went wrong", error });
  }
}

export const employeeApplyLeave = (req, res) => {
    try {
        const { startDate, endDate, id, reason } = req.body;
        let queryReplacement = {
            startDate,
            endDate,
            id,
            reason
        }
         if(!startDate) {
            res.status(400).send({ message: "startDate is required" });
         } else if (!endDate) {
            res.status(400).send({ message: "endDate is required" });
         } else if (!reason) {
            res.status(400).send({ message: "reason is required" });
         } else if (!id) {
            res.status(400).send({ message: "id is required" });
         } else {
        db.query(APPLY_LEAVE,{
            type: db.QueryTypes.INSERT,
            replacements: queryReplacement,
        }).then(()=> {
            res
          .status(200)
          .send({ status: "success", message: "You have Successfully applied the leave" });
        })
    }
    } 
    catch(error){

    }
}