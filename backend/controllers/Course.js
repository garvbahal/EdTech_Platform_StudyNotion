const Course = require("../models/Course.js");
const Tag = require("../models/Tag.js");
const User = require("../models/User.js");
const { uploadImageToCloudinary } = require("../utils/imageUploader.js");

// create course
exports.createCourse = async (req, res) => {
    try {
        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tag } =
            req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag ||
            !thumbnail
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

        // check given tag is valid or not
        const tagDetails = await Tag.findById(tag);

        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag details not found",
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
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url,
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

        // update TAG SCHEMA

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
