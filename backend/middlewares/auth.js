const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User.js");

// auth
exports.auth = async (req, res, next) => {
    try {
        // extract token
        const token =
            req.cookies.token ||
            req.body.token ||
            req.header("Authorisation").replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        // verify the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);

            req.user = decode;
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }
        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
};

// is Student

exports.isStudent = async (req, res, next) => {
    try {
        const role = req.user.role;

        if (role !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for students only",
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};

// isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        const role = req.user.role;

        if (role !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for instructor only",
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};

// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        const role = req.user.role;

        if (role !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a protected route for Admin only",
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "User role cannot be verified",
        });
    }
};
