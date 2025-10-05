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

// category page details
exports.categoryPageDetails = async (req, res) => {
    try {
        // get categoryId
        const { categoryId } = req.body;

        // fetch all the courses corresponding to the categoryId
        const selectedCategory = await Category.findById(categoryId)
            .populate("courses")
            .exec();

        // validation
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Courses/Data not found",
            });
        }

        // get courses for different categories
        const differentCategories = await Category.find({
            _id: { $ne: categoryId },
        })
            .populate("courses")
            .exec();

        // get top selling courses
        // HW:- WRITE IT ON YOUR OWN

        // return response
        return res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategories,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message:
                "Something went wrong while fetching category page details",
            error: err.message,
        });
    }
};
