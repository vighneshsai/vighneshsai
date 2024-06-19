import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import employeeDbModel from "./Models/employee.js"
import jwt from "jsonwebtoken";
import db from './db/dbconnections.js'
import { Op } from 'sequelize';
import cookieSession from "cookie-session";
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();
app.use(express.json());

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use(function (req, res, next) {
  
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "content-type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "DELETE,PATCH");

  next();
});
const EmployeeDetails = `SELECT AL.STARTDATE,AL.ENDDATE, AL.REASON, AL.APPROVAL
    FROM APPLIEDLEAVE AL 
    INNER JOIN EMPLOYEE E ON AL.EMPLOYEEID = E.ID WHERE `

app.get("/employee", (req, res) => {
  employeeDbModel.findAll({})
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
});
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

app.post("/employee/availableLeave", async (req, res) => {
    const personalLeave = 12
    const sickLeave = 8
    try {
      const { phoneNumber, email, id } = req.body;
     console.log(id, req.body, "id")
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
        res
        .status(200)
        .send({ message: "succesfully user added", status: "success", response });
      })
      
    } catch (error) {
      res.status(400).send({ message: "something went wrong", error });
    }
  
  });
  app.post("/employee/appliedLeave", async (req, res) => {
   
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

    var employeeQuery = EmployeeDetails + whereClause;
  
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
        .send({ message: "succesfully user added", status: "success", response });
      })
      
    } catch (error) {
      res.status(400).send({ message: "something went wrong", error });
    }
  
  });

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await userDbModel.create({
      email: email,
      password: password,
    });
    res
      .status(200)
      .send({ message: "succesfully user added", status: "success", user });
  } catch (error) {
    res.status(400).send({ message: "something went wrong", error });
  }

});

app.post("/login", async (req, res) => {
  try {
    userDbModel.findOne({
      where: {
        email: req.body.email,
        password: req.body.password,
      },
    }).then((user) => {
      if (user !== null) {
        
        const payload = { username: user.email }
        let accessToken = generteAccessToken(payload)
        let refreshToken = jwt.sign(payload, process.env.REFRESS_TOKEN_SECRET)
        res
          .status(200)
          .send({ message: "succesfully user loggined", status: "success", accessToken, refreshToken, user });

      } else {
        res.status(400).send({ message: "User not found" });
      }
    })
  } catch (error) {
    res.status(400).send({ message: "invalid credentials", error });
  }
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401)
  jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(401)
    } else {

      const payload = { username: user.username }
      const accessToken = generteAccessToken(payload)
      res.status(200).send({ accessToken });
    }
  })
});



function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  console.log(token, authHeader.split(' '))
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

function generteAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
}

app.listen(3005, (req, res) => {
  console.log("Operation port 3005 port is running");
});
