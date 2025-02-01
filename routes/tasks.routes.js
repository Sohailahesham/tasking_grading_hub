const router = require("express").Router();
const {
  getAllTasks,
  addTask,
  getTask,
  uploadFile,
  getSubmissions,
  getSubmission,
  addGrade,
  updateTask,
  deleteTask,
  deleteSubmission,
} = require("../controllers/tasks.controller");
const allowedTo = require("../middlewares/allowedTo");
const { validator } = require("../middlewares/validation");
const verifyToken = require("../middlewares/verifyToken");
const { asyncWrapper } = require("../middlewares/wrapper");
const { body } = require("express-validator");
const { isTokenRevoked } = require("../middlewares/revokeToken");
const upload = require("../utils/multer");

const taskValidetion = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be between 3 and 255 characters."),
  body("description")
    .isLength({ max: 2000 })
    .withMessage("Description must not exceed 2000 characters."),
  body("deadline")
    .notEmpty()
    .withMessage("Deadline is required")
    .isISO8601()
    .withMessage("Deadline must be a valid date (ISO 8601 format).")
    .isAfter(new Date().toISOString())
    .withMessage("Deadline must be a future date."),
];

router
  .route("/")
  .get(verifyToken, isTokenRevoked, asyncWrapper(getAllTasks))
  .post(
    verifyToken,
    isTokenRevoked,
    taskValidetion,
    validator,
    allowedTo("ADMIN"),
    asyncWrapper(addTask)
  );

router
  .route("/:taskId")
  .get(verifyToken, isTokenRevoked, asyncWrapper(getTask))
  .post(
    verifyToken,
    isTokenRevoked,
    allowedTo("STUDENT"),
    upload.single("file"),
    asyncWrapper(uploadFile)
  )
  .patch(
    verifyToken,
    isTokenRevoked,
    allowedTo("ADMIN"),
    asyncWrapper(updateTask)
  )
  .delete(
    verifyToken,
    isTokenRevoked,
    allowedTo("ADMIN"),
    asyncWrapper(deleteTask)
  );

router
  .route("/:taskId/submissions")
  .get(verifyToken, isTokenRevoked, asyncWrapper(getSubmissions));
router
  .route("/:taskId/submissions/:submissionId")
  .get(verifyToken, isTokenRevoked, asyncWrapper(getSubmission))
  .delete(
    verifyToken,
    isTokenRevoked,
    allowedTo("STUDENT"),
    asyncWrapper(deleteSubmission)
  );

router
  .route("/:taskId/submissions/:submissionId/grade")
  .post(
    verifyToken,
    isTokenRevoked,
    [
      body("grade")
        .isInt({ min: 0, max: 100 })
        .withMessage("Grade should be between 0 and 100"),
      body("feedback")
        .isLength({ max: 500 })
        .withMessage("feedback should not exceed 500 characters"),
    ],
    validator,
    allowedTo("ADMIN"),
    asyncWrapper(addGrade)
  );

module.exports = router;
