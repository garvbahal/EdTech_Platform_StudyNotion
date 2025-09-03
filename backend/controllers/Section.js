const Section = require("../models/Section.js");
const Course = require("../models/Course.js");

exports.createSection = async (req, res) => {
    try {
        // fetch data
        const { sectionName, courseId } = req.body;

        // validate the data
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // create a section
        const newSection = await Section.create({
            sectionName,
        });

        // push the object id of section into the course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true }
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "Section has been created successfully",
            updatedCourse,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while creating section",
            error: err.message,
        });
    }
};

exports.updateSection = async (req, res) => {
    try {
        // fetch data
        const { sectionName, sectionId } = req.body;

        // validate the data
        if (!sectionId || !sectionName) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // update the data
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                sectionName: sectionName,
            },
            { new: true }
        );

        // return response
        return res.status(200).json({
            success: true,
            message: "Section has been updated successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating section",
            error: err.message,
        });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        // fetch the data - assuming we are sending id in params
        const { sectionId } = req.params;

        // use findbyIdAndDelete
        await Section.findByIdAndDelete(sectionId);

        // TODO: DO WE NEED TO DELETE THE ENTRY FROM COURSE SCHEMA

        // return response
        return res.status(200).json({
            success: true,
            message: "Section has been deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting a section",
            error: err.message,
        });
    }
};
