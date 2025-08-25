const OTP = require("../models/OTP.js");
const User = require("../models/User.js");
const otpGenerator = require("otp-generator");

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
            message: "OTP created Successfully",
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

// login
