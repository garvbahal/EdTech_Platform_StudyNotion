const Category = require("../models/Category");

// create category handler function
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });

        console.log(categoryDetails);

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating a category",
            error: err.message,
        });
    }
};

// get all categories
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find(
            {},
            { name: true, description: true }
        );

        return res.status(200).json({
            success: true,
            message: "All categories returned successfully",
            allCategories,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong while showing all categories",
            error: err.message,
        });
    }
};
