const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60,
    },
});

const sendVerificationEmail = async (email, otp) => {
    try {
        const mailResponse = await mailSender(
            email,
            "Verification Email from Study Notion",
            otp
        );
        console.log("Mail send successfully: ", mailResponse);
    } catch (err) {
        console.log("Error occurred while sending mail", err.message);
        throw err;
    }
};

otpSchema.pre("save", async function (next) {
    try {
        await sendVerificationEmail(this.email, this.otp);
        next();
    } catch (err) {
        console.log(
            "Error occurred while sending verification mail: ",
            err.message
        );
        return next(err);
    }
});

module.exports = mongoose.model("OTP", otpSchema);
