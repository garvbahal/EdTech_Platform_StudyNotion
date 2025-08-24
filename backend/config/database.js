const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
    mongoose
        .connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log("DB CONNECTION SUCCESSFUL"))
        .catch((error) => {
            console.log("DB CONNECTION FAILED");
            clg.error(error);
            process.exit(1);
        });
};
