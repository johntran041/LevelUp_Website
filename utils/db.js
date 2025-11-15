require("dotenv").config();
const mongoose = require("mongoose");

const { database } = require("../configs/keys");

const connectDB = async () => {
    try {
        const chalk = (await import("chalk")).default;
        await mongoose
            .connect(database.url)
            .then(() =>
                console.log(
                    `${chalk.green("✓")} ${chalk.blue("MongoDB Connected!")}`
                )
            )
            .catch((err) => console.log(err));
    } catch (error) {
        console.error(
            `${chalk.red("X")} ${chalk.blue("MongoDB Connected!")}`,
            error
        );
    }
};

module.exports = connectDB;
