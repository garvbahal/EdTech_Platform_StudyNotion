const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

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

// get All ratings
