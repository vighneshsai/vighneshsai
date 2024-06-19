import { employeeApplyLeave, getAllEmployees, getEmployeeAppliedLeave, getEmployeeAvailableLeave } from "../DAO/employeeDAO.js";


export function getEmployees(req, res) {
    try {
        return getAllEmployees(req, res);
    } catch (err) {
        return new Error(err);
    }
}

export function getAvailableLeave(req, res) {
    try {
        return getEmployeeAvailableLeave(req, res);
    } catch (err) {
        return new Error(err);
    }
}
export function getAppliedLeave(req, res) {
    try {
        return getEmployeeAppliedLeave(req, res);
    } catch (err) {
        return new Error(err);
    }
}
export function applyLeave(req, res) {
    try {
        return employeeApplyLeave(req, res);
    } catch (err) {
        return new Error(err);
    }
}