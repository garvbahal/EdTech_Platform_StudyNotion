const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");

// capture the payment and initiate the razorpay order
exports.capturePayment = async (req, res) => {
    try {
        // get courseId and UserId
        const { course_id } = req.body;
        const userId = req.user.id;

        // do validation
        if (!course_id) {
            return res.status(404).json({
                success: false,
                message: "Please provide course id",
            });
        }

        // check valid courseId
        // check valid courseDetail
        // check if user payed for same course
        // create order
        // return response
    } catch (err) {}
};
