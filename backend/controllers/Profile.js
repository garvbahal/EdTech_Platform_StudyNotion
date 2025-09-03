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

// delete the account

exports.deleteAccount = async (req, res) => {
    try {
        // fetch the id
        const userId = req.user.id;

        // do validation
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User Id is not correct",
            });
        }

        // delete the profile first
        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete(profileId);

        // HW: UNEROLLED USER FROM ALL ENROLLED COURSES

        // delete the user
        await User.findByIdAndDelete(userId);

        // return response
        return res.status(200).json({
            success: true,
            message: "User has been deleted successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the user account",
            error: err.message,
        });
    }
};

exports.getAllUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        const userDetails = await User.findById(userId)
            .populate("additionalDetails")
            .exec();

        return res.status(200).json({
            success: true,
            message: "User data has been fetched successfully",
            user: userDetails,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching user-details",
            error: err.message,
        });
    }
};
