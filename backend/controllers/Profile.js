const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
    try {
        // get the data
        const {
            dateOfBirth = "",
            about = "",
            contactNumber,
            gender,
        } = req.body;

        // get userId
        const userId = req.user.id;

        // validation
        if (!contactNumber || !gender || !userId) {
            return res.status(404).json({
                success: false,
                message: "All fields are required",
            });
        }

        // find the profile
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // update the profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.contactNumber = contactNumber;
        profileDetails.about = about;
        profileDetails.gender = gender;

        await profileDetails.save();

        // return response
        return res.status(200).json({
            success: true,
            message: "Profile details have been updated successfully",
            profileDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating profile",
            error: err.message,
        });
    }
};
