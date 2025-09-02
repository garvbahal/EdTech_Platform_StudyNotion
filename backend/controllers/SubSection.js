const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create subsection
exports.createSubSection = async (req, res) => {
    try {
        // fetch the data
        const { sectionId, title, timeDuration, description } = req.body;

        // extract file/video
        const video = req.files.videoFile;

        // validate
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // upload the video to cloudinary
        const uploadedDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME
        );

        // create subsection
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadedDetails.secure_url,
        });

        // update the section
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            {
                $push: {
                    subSection: subSectionDetails._id,
                },
            },
            {
                new: true,
            }
        );

        // HW : LOG UPDATED SECTION HERE AFTER ADDING POPULATE QUERY

        // return the response
        return res.status(200).json({
            success: true,
            message: "Subsection has been created successfully",
            updatedSection,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating sub-section",
            error: err.message,
        });
    }
};

// HW : WRITE UPDATE SUBSECTION

// HW : WRITE DELETE SUBSECTION
