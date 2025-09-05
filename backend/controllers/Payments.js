const { default: mongoose } = require("mongoose");
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");

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
        const course = await Course.findById(course_id);
        // check valid courseDetail
        if (!course) {
            return res.status(400).json({
                success: false,
                message: "Could not find the course",
            });
        }

        // check if user payed for same course
        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success: false,
                message: "Student is already enrolled",
            });
        }

        // create order
        const amount = course.price;
        const currency = "INR";
        const options = {
            amount: amount * 100,
            currency: currency,
            recipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: course_id,
                userId,
            },
        };

        const paymentResponse = await instance.orders.create(options);
        console.log(paymentResponse);

        // return response
        return res.status(200).json({
            success: true,
            message: "Order has been created successfully",
            courseName: course.courseName,
            courseDescription: course.coursDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating order",
            error: err.message,
        });
    }
};

// verify signature of razorpay and server
exports.verifySignature = async (req, res) => {
    try {
        const webHookSecret = process.env.WEB_HOOK_SECRET;

        const signature = req.headers["x-razorpay-signature"];

        const shasum = crypto.createHmac("sha256", webHookSecret);

        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest("hex");

        if (signature === digest) {
            console.log("Payment is Authorised");

            const { courseId, userId } = req.body.payload.payment.entity.notes;

            // find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                {
                    $push: {
                        studentsEnrolled: userId,
                    },
                },
                {
                    new: true,
                }
            );

            // find the student and add course in it
            const enrolledStudent = await User.findOneAndUpdate(
                {
                    _id: userId,
                },
                {
                    $push: {
                        courses: courseId,
                    },
                },
                { new: true }
            );

            // SEND the confirmation mail

            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from StudyNotion",
                "Congratulation, you are onboarded into new course"
            );

            return res.status(200).json({
                success: true,
                message: "Signature Verified and student is enrolled in course",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid signature request",
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while verifying the signature",
            error: err.message,
        });
    }
};
