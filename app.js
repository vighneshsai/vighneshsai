import mysql from "mysql";
import express from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import apiRouter from './routes/api.js'

import cookieSession from "cookie-session";
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();
app.use(express.json());

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use("/api", apiRouter);

app.use(function (req, res, next) {

  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Headers", "content-type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "DELETE,PATCH");

  next();
});

// app.post("/signin", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     let user = await userDbModel.create({
//       email: email,
//       password: password,
//     });
//     res
//       .status(200)
//       .send({ message: "succesfully user added", status: "success", user });
//   } catch (error) {
//     res.status(400).send({ message: "something went wrong", error });
//   }

// });

// app.post("/login", async (req, res) => {
//   try {
//     userDbModel.findOne({
//       where: {
//         email: req.body.email,
//         password: req.body.password,
//       },
//     }).then((user) => {
//       if (user !== null) {

//         const payload = { username: user.email }
//         let accessToken = generteAccessToken(payload)
//         let refreshToken = jwt.sign(payload, process.env.REFRESS_TOKEN_SECRET)
//         res
//           .status(200)
//           .send({ message: "succesfully user loggined", status: "success", accessToken, refreshToken, user });

//       } else {
//         res.status(400).send({ message: "User not found" });
//       }
//     })
//   } catch (error) {
//     res.status(400).send({ message: "invalid credentials", error });
//   }
// });

// app.post("/token", (req, res) => {
//   const refreshToken = req.body.token;
//   if (!refreshToken) return res.sendStatus(401)
//   jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET, (err, user) => {
//     if (err) {
//       return res.sendStatus(401)
//     } else {

//       const payload = { username: user.username }
//       const accessToken = generteAccessToken(payload)
//       res.status(200).send({ accessToken });
//     }
//   })
// });



// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (token == null) return res.sendStatus(401)
//   console.log(token, authHeader.split(' '))
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403)
//     req.user = user
//     next()
//   })
// }

// function generteAccessToken(payload) {
//   return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
// }

app.listen(3005, (req, res) => {
  console.log("Operation port 3005 port is running");
});
