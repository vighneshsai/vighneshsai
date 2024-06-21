import employeeDbModel from "../Models/employee.js"
import { Op } from 'sequelize';
import db from '../db/dbconnections.js'

const EMPLOYEE_DETAILS = `SELECT AL.STARTDATE,AL.ENDDATE, AL.REASON, AL.APPROVAL
    FROM appliedLeave AL 
    INNER JOIN employee E ON AL.EMPLOYEEID = E.ID WHERE `

const APPLY_LEAVE = "INSERT INTO appliedLeave (startDate, endDate, employeeId, reason) " +
    "VALUES (:startDate, :endDate, :id, :reason)";

const AVALABLE_LEAVE = "SELECT E.ID, AP.STARTDATE, AP.ENDDATE, AP.LEAVETYPE " +
    " FROM employee E " +
    " INNER JOIN appliedLeave AP ON AP.EMPLOYEEID = E.ID WHERE ";

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
function getCurrentFinancialYear() {
    const now = new Date();
    let startYear, endYear;

    if (now.getMonth() >= 3) { // April is month 3 in JavaScript (0-based index)
        startYear = now.getFullYear();
        endYear = now.getFullYear() + 1;
    } else {
        startYear = now.getFullYear() - 1;
        endYear = now.getFullYear();
    }

    const startDate = new Date(`${startYear}-04-01`);
    const endDate = new Date(`${endYear}-03-31`);

    return { startDate, endDate };
}

// Function to calculate the number of weekdays between two dates
function countWeekdaysBetweenDates(fromDate, toDate) {
    let count = 0;
    let currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
        const day = currentDate.getDay();
        if (day !== 0 && day !== 6) { // Exclude Sundays (0) and Saturdays (6)
            count++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
}

// Function to filter and count weekdays for a list of date ranges within the current financial year
function filterAndCountWeekdays(dateRanges) {
    const { startDate: fyStartDate, endDate: fyEndDate } = getCurrentFinancialYear();
    let totalWeekdays = 0;

    dateRanges.forEach(range => {
        const { startDate, endDate } = range;
        const from = new Date(startDate);
        const to = new Date(endDate);

        if (to >= fyStartDate && from <= fyEndDate) {
            const rangeStart = from < fyStartDate ? fyStartDate : from;
            const rangeEnd = to > fyEndDate ? fyEndDate : to;
            totalWeekdays += countWeekdaysBetweenDates(rangeStart, rangeEnd);
        }
    });

    return totalWeekdays;
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

        db.query(employeeQuery, {
            type: db.QueryTypes.SELECT
        }).then((data) => {
            var response = []
            for (var i = 0; i < data.length; i++) {
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
    const totalPersonalLeave = 12
    const totalSickLeave = 8
    try {
        const { phoneNumber, email, id } = req.body;
        let conditions = [];
        let availableLeaveQuery = AVALABLE_LEAVE
        if (!id && !email && !phoneNumber) {
            throw new Error("Please provide id or phoneNumber or email")
        }
        // Add conditions only if the respective variables are defined
        if (id !== undefined) {
            conditions.push(`E.ID = ${id}`);
        }
        if (phoneNumber !== undefined) {
            conditions.push(`E.PHONENUMBER = ${phoneNumber}`);
        }
        if (email !== undefined) {
            conditions.push(`E.EMAIL = '${email}'`);
        }
        availableLeaveQuery += conditions.join(' OR ')
        db.query(availableLeaveQuery, {
            type: db.QueryTypes.SELECT,
        }).then((data) => {
            var casualLeave = []
            var sickLeave = []
            for (var i = 0; i < data.length; i++) {
                if (data[i].LEAVETYPE == "casual") {
                    var dateObj = {
                        startDate: data[i].STARTDATE,
                        endDate: data[i].ENDDATE
                    }
                    casualLeave.push(dateObj)
                } else {
                    var dateObj = {
                        startDate: data[i].STARTDATE,
                        endDate: data[i].ENDDATE
                    }
                    sickLeave.push(dateObj)
                }
            }
            const totalCasualLeaveTaken = filterAndCountWeekdays(casualLeave);
            const totalSickLeaveTaken = filterAndCountWeekdays(sickLeave);
            var availableCasualLeave = totalPersonalLeave - totalCasualLeaveTaken
            var availableSickLeave = totalSickLeave - totalSickLeaveTaken
            var response = {
                totalCasualLeave: 12,
                totalSickLeave: 8,
                availableCasualLeave,
                availableSickLeave
            }
            res.status(200).send({ status: "success", response });

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
        if (!startDate) {
            res.status(400).send({ message: "startDate is required" });
        } else if (!endDate) {
            res.status(400).send({ message: "endDate is required" });
        } else if (!reason) {
            res.status(400).send({ message: "reason is required" });
        } else if (!id) {
            res.status(400).send({ message: "id is required" });
        } else {
            db.query(APPLY_LEAVE, {
                type: db.QueryTypes.INSERT,
                replacements: queryReplacement,
            }).then(() => {
                res
                    .status(200)
                    .send({ status: "success", message: "You have Successfully applied the leave" });
            })
        }
    }
    catch (error) {

    }
}