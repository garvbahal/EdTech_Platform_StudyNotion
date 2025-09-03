const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        trim: true,
        required: true,
    },
    coursDescription: {
        type: String,
        trim: true,
        requried: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    whatYouWillLearn: {
        type: String,
        required: true,
        trim: true,
    },
    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section",
        },
    ],
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview",
        },
    ],
    price: {
        type: Number,
        required: true,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        requried: true,
    },
    tag: {
        type: String,
        trim: true,
    },
    studentsEnrolled: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
});

module.exports = mongoose.model("Course", courseSchema);
