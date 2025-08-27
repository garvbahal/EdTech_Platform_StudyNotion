const User = require("../models/User.js");
const mailSender = require("../utils/mailSender.js");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// resetPassword Token

exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req body
        const { email } = req.body;

        // check email exists in db.... validate email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Your email is not registered",
            });
        }

        // generate  token
        const rawtoken = crypto.randomUUID();
        const hashedToken = crypto
            .createHash("sha256")
            .update(rawtoken)
            .digest("hex");

        // upadate token in user
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: hashedToken,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true }
        );
        // update expiration time in user
        // create url
        const url = `http://localhost:5173/update-password/${rawtoken}`;

        // send mail sending url
        const response = await mailSender(
            email,
            "Password Reset Link",
            `Password Reset Link: ${url}`
        );

        // return res
        return res.status(200).json({
            success: true,
            message:
                "Email send successfully, please check email and change password",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error while generating reset password token",
            error: err.message,
        });
    }
};

// reset Password

exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        // frontend me token bhej denge req.body me
        const { password, confirmPassword, token } = req.body;
        // do validation
        if (password !== confirmPassword) {
            return res.status(401).json({
                success: false,
                message: "Password and confirmPassword is not matching",
            });
        }
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // get user details from db using token
        const userDetails = await User.findOne({ token: hashedToken });

        // if no entry->invalid token
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            });
        }
        // check token time
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(401).json({
                success: false,
                message: "Reset Password Token is expired",
            });
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update the password
        await User.findOneAndUpdate(
            { token: hashedToken },
            {
                password: hashedPassword,
                token: undefined,
                resetPasswordExpires: undefined,
            },
            { new: true }
        );
        // return res
        return res.status(200).json({
            success: true,
            message: "Password reset successful!",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while resetting the password",
            error: err.message,
        });
    }
};
