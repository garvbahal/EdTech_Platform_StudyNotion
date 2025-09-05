const Course = require("../models/Course.js");
const Category = require("../models/Category.js");
const User = require("../models/User.js");
const { uploadImageToCloudinary } = require("../utils/imageUploader.js");

// create course
exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
            tag,
        } = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !category ||
            !thumbnail ||
            !tag
        ) {
            return res.status(400).json({
                success: false,
                message: "All Fields are required",
            });
        }

        // check for instructor
        const userId = req.user.id;

        const instructorDetails = await User.findById(userId);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found",
            });
        }

        // check given category is valid or not
        const categoryDetails = await Category.findById(category);

        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category details not found",
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        );

        // create an entry for new course
        const newCourse = await Course.create({
            courseName: courseName,
            courseDescription: courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price: price,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            tag: tag,
        });

        // instructor needs to be updated
        await User.findByIdAndUpdate(
            instructorDetails._id,
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );

        // update CATEGORY SCHEMA
        categoryDetails.course.push(newCourse._id);
        await categoryDetails.save();

        // return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating course",
            error: err.message,
        });
    }
};

// get all courses
exports.showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            {},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        )
            .populate("instructor")
            .exec();

        return res.status(200).json({
            success: true,
            message: "Data for all courses fetched successfully",
            data: allCourses,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching all courses",
            error: err.message,
        });
    }
};

// HW: GET COURSE DETAIL AFTER POPULATING
exports.getCourseDetails = async (req, res) => {
    try {
        // fetch the course id
        const { courseId } = req.body;

        // find courseDetails
        const courseDetails = await Course.findById(courseId)
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course Details fetched successfully",
            data: courseDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting course details",
            error: err.message,
        });
    }
};
