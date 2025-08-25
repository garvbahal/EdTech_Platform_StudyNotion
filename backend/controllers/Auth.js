const OTP = require("../models/OTP.js");
const User = require("../models/User.js");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const Profile = require("../models/Profile.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// send OTP
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const checkEmailExists = await User.findOne({ email: email });

        if (checkEmailExists) {
            return res.status(401).json({
                success: false,
                message: "User Already Existed",
            });
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        let isOtpExistsBefore = await OTP.findOne({ otp: otp });

        while (isOtpExistsBefore) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            isOtpExistsBefore = await OTP.findOne({ otp: otp });
        }

        const otpPayload = {
            otp,
            email,
        };

        const dbResponse = await OTP.create(otpPayload);

        return res.status(200).json({
            success: true,
            message: "OTP send Successfully",
            otp,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// sign up

exports.signUp = async (req, res) => {
    try {
        const {
            email,
            password,
            otp,
            firstName,
            lastName,
            accountType,
            confirmPassword,
            contactNumber,
        } = req.body;

        if (
            !email ||
            !password ||
            !otp ||
            !firstName ||
            !lastName ||
            !confirmPassword
        ) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password Value doesn't match",
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Account already registered",
            });
        }

        const recentOtp = await OTP.find({ email })
            .sort({ createdAt: -1 })
            .limit(1);

        console.log("Recent OTP: ", recentOtp);

        if (recentOtp.length == 0) {
            return res.status(400).json({
                success: false,
                message: "OTP Not Found",
            });
        } else if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP Not Matching",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            about: null,
            dateOfBirth: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        return res.status(200).json({
            success: true,
            message: "User Registered Successfully",
            user,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered, please try again",
        });
    }
};

// login

exports.login = async (req, res) => {
    try {
        // get data from request Body
        const { email, password } = req.body;

        // validation of data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            });
        }

        // user checks if exists or not
        const user = await User.findOne({ email }).populate(
            "additionalDetails"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, please signup first",
            });
        }

        // generate jwt token, after matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                role: user.accountType,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully",
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            });
        }

        // create cookie
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Login Failure, Please try again",
        });
    }
};
