const router = require("express").Router();
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });

const { preventAuthAccess } = require("../middlewares/auth");

const {
    renderAdminUser,
    renderAdminUserAdd,
    renderAdminUserDetail,
    addNewUser,
    updateUser,
    achiveUser,
    deleteUser,
} = require("../controllers/admin/User");

const {
    renderAdminInstitution,
    renderAdminInstitutionAdd,
    renderAdminInstitutionDetail,
    addNewInstitution,
    updateInsstitution,
    achieveInstitution,
    deleteInstitution,
} = require("../controllers/admin/Institution");

const {
    renderCourse,
    addNewCourse,
    renderCourseAdd,
    updateCourseDetail,
    deleteCourse,
    renderCourseDetail,
} = require("../controllers/admin/Course");

const {
    renderPost,
    achievePost,
    deletePost,
} = require("../controllers/admin/Post");

// User Routes
router.get("/users", preventAuthAccess, renderAdminUser);
router.get("/users/add", preventAuthAccess, renderAdminUserAdd);
router.post("/users/add", upload.single("avatar"), addNewUser);
router.post("/users/update/:userId", upload.single("avatar"), updateUser);
router.post("/users/archive/:userId", achiveUser);
router.post("/users/delete/:userId", deleteUser);
router.get("/users/:userId", preventAuthAccess, renderAdminUserDetail);

// Institution Routes
router.get("/institutions", preventAuthAccess, renderAdminInstitution);
router.get("/institutions/add", preventAuthAccess, renderAdminInstitutionAdd);
router.post("/institutions/add", addNewInstitution);
router.post("/institutions/update/:userId", updateInsstitution);
router.post("/institutions/archive/:userId", achieveInstitution);
router.post("/institutions/delete/:userId", deleteInstitution);
router.get(
    "/institutions/:institutionId",
    preventAuthAccess,
    renderAdminInstitutionDetail
);

// Course Routes
router.get("/courses", preventAuthAccess, renderCourse);
router.get("/courses/add", preventAuthAccess, renderCourseAdd);
router.post("/courses/add", addNewCourse);
router.post("/courses/update/:courseId", updateCourseDetail);
router.post("/courses/delete/:courseId", deleteCourse);
router.get("/courses/:courseId", preventAuthAccess, renderCourseDetail);

// Posts Routes
router.get("/posts", preventAuthAccess, renderPost);
router.post("/posts/achieve/:postId", achievePost);
router.post("/posts/delete/:postId", deletePost);

router.post("/logout", (req, res) => {
    res.clearCookie("userId");
    res.clearCookie("userRole");
    res.redirect("/");
});
module.exports = router;
