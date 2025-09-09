const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// create rating
exports.createRating = async (req, res) => {
    try {
        // get userId
        const userId = req.user.id;

        // fetch data from req.body
        const { rating, review, courseId } = req.body;

        // check if user is enrolled or not
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $elemMatch: { $eq: userId } },
        });
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course",
            });
        }

        // check if user has already reviewed the course or not
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        });

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user",
            });
        }

        // create rating and review
        const ratingAndReviewDetails = await RatingAndReview.create({
            user: userId,
            rating,
            review,
            course: courseId,
        });

        // add rating to course model
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    ratingAndReviews: ratingAndReviewDetails._id,
                },
            },
            { new: true }
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Rating & Review has been created successfully",
            ratingAndReviewDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating rating&review",
            error: err.message,
        });
    }
};

// get Avg rating
exports.getAverageRating = async (req, res) => {
    try {
        // get course id
        const courseId = req.body.courseId;

        // calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group: {
                    _id: null,
                    averageRating: {
                        $avg: "$rating",
                    },
                },
            },
        ]);

        // return rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, no ratings given till now",
            averageRating: 0,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting average rating",
            error: err.message,
        });
    }
};

// get All ratings and Reviews
exports.getAllRating = async (req, res) => {
    try {
        const allReviews = await RatingAndReview.find({})
            .sort({
                rating: "desc",
            })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec();

        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while getting all ratings and reviews",
            error: err.message,
        });
    }
};

// HW: get all ratings and reviews corressponding to course id
