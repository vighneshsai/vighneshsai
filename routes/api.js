import express from "express";
const router = express.Router();
import { catchErrors } from "../handlers/errorHandler.js";
import { applyLeave, getAppliedLeave, getAvailableLeave, getEmployees } from "../controllers/employeeController.js";

// Use catchErrors middleware to handle errors for async functions
router.route("/employee").get(catchErrors(getEmployees));
router.route("/employee/availableLeave").post(catchErrors(getAvailableLeave));
router.route("/employee/appliedLeave").post(catchErrors(getAppliedLeave));
router.route("/employee/leaveApply").post(catchErrors(applyLeave));



export default router;

