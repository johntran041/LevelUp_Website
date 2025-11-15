const Institution = require("../../models/Institution");
const bcrypt = require("bcrypt");

exports.renderAdminInstitution = async (req, res) => {
    try {
        const institutions = await Institution.find().lean();
        res.render("adminInstitution", {
            institutions,
            activePage: "institutions",
        });
    } catch (error) {
        console.error("Error fetching institutions:", error);
        res.status(500).send("Server Error");
    }
};

exports.renderAdminInstitutionAdd = (req, res) => {
    res.render("adminInstitutionAdd", { activePage: "institutions" });
};

exports.addNewInstitution = async (req, res) => {
    try {
        const { email, password, institutionName } = req.body;

        // Basic validation
        if (!email || !password || !institutionName) {
            throw new Error("Still need required input");
        }

        // Hash the password securely
        // const saltRounds = 12;
        // const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create and save new institution
        const newInstitution = new Institution({
            email,
            password,
            name: institutionName,
            // courses, instructors, students can be empty arrays
            courses: [],
            instructors: [],
            students: [],
        });

        await newInstitution.save();

        res.redirect("/admin/institutions");
    } catch (err) {
        console.error("Error creating institution:", err);
        res.status(500).send("Failed to create institution.");
    }
};

exports.updateInsstitution = async (req, res) => {
    try {
        const { userId } = req.params;
        const { email, password, name } = req.body;

        if (!email || !name) {
            return res.status(400).send("Missing required fields");
        }

        const institution = await Institution.findById(userId);
        if (!institution) return res.status(404).send("Institution not found");

        institution.email = email;
        institution.name = name;
        institution.password = password;

        await institution.save();
        res.redirect("/admin/institutions");
    } catch (error) {
        console.error("Error updating institution:", error);
        res.status(500).send("Failed to update institution");
    }
};

exports.achieveInstitution = async (req, res) => {
    try {
        const { userId } = req.params;
        await Institution.findByIdAndUpdate(userId, { status: "inactive" });
        res.status(200).send("Institution archived");
    } catch (err) {
        console.error("Error archiving institution:", err);
        res.status(500).send("Failed to archive institution");
    }
};

exports.deleteInstitution = async (req, res) => {
    try {
        const { userId } = req.params;
        await Institution.findByIdAndDelete(userId);
        res.status(200).send("Institution deleted");
    } catch (err) {
        console.error("Error deleting institution:", err);
        res.status(500).send("Failed to delete institution");
    }
};

exports.renderAdminInstitutionDetail = async (req, res) => {
    try {
        const { institutionId } = req.params;
        const institution = await Institution.findById(institutionId).lean();

        if (!institution) {
            return res.status(404).send("Institution not found");
        }

        res.render("adminInstitutionDetail", {
            institution,
            activePage: "institutions",
        });
    } catch (error) {
        console.error("Error fetching institution:", error);
        res.status(500).send("Server Error");
    }
};
