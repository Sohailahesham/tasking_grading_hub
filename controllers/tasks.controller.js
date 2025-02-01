const Task = require("../models/Task");
const appError = require("../utils/appError");
const Submission = require("../models/submissions");

const getAllTasks = async (req, res, next) => {
  const tasks = await Task.find();
  res.status(200).json({
    status: "success",
    message: "Tasks retrieved successfully",
    data: { tasks },
  });
};
const addTask = async (req, res, next) => {
  const { title, description, deadline } = req.body;
  const newTask = new Task({
    title,
    description,
    deadline,
  });
  await newTask.save();
  res.status(201).json({
    status: "success",
    message: "task created successfully",
    data: {
      task: newTask,
    },
  });
};

const getTask = async (req, res) => {
  const id = req.params.taskId;
  const task = await Task.findById(id);
  if (!task) {
    const error = appError.create("Task Not Found", 404, "FAIL");
    return next(error);
  }
  res.status(200).json({
    status: "success",
    message: "task retrieved successfully",
    data: {
      task,
    },
  });
};

const uploadFile = async (req, res, next) => {
  const taskId = req.params.taskId;
  const studentId = req.user.id; // This assumes `verifyToken` sets req.user
  const studentEmail = req.user.email;

  console.log(req.user);
  //   console.log("Task ID:", taskId);
  //   console.log("Student ID:", studentId);
  //   console.log("Uploaded file:", req.file);
  const currentDate = new Date();
  const task = await Task.findById(taskId);

  if (!req.file) {
    return res
      .status(400)
      .json({ status: "ERROR", message: "No file uploaded" });
  }
  if (currentDate > task.deadline) {
    const error = appError.create(
      "Submission deadline has passed",
      400,
      "FAIL"
    );
    return next(error);
  }
  const newSubmission = new Submission({
    taskId,
    studentId,
    studentEmail,
    fileUrl: req.file.path, // File saved with filename or full path
  });

  await newSubmission.save();
  res.status(200).json({
    status: "success",
    message: "File uploaded successfully",
    data: {
      submission: newSubmission,
    },
  });
};

const getSubmissions = async (req, res, next) => {
  const taskId = req.params.taskId;
  const userRole = req.user.role;
  const userId = req.user.id;
  let submissions;
  if (userRole === "ADMIN") {
    submissions = await Submission.find({ taskId });
  } else {
    submissions = await Submission.find({
      taskId,
      studentId: userId,
    });
  }
  res.status(200).json({
    status: "success",
    message: "Submissions retrieved successfully",
    data: {
      submissions,
    },
  });
};

const getSubmission = async (req, res, next) => {
  const submissionId = req.params.submissionId;
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    const error = appError.create("Submission Not Found", 404, "FAIL");
    return next(error);
  }
  res.status(200).json({
    status: "success",
    message: "Submission retrieved successfully",
    data: {
      submission,
    },
  });
};

const addGrade = async (req, res, next) => {
  const { grade, feedback } = req.body;
  const submissionId = req.params.submissionId;
  const submission = await Submission.findById(submissionId);
  if (!submission) {
    const error = appError.create("Submission Not Found", 404, "FAIL");
    return next(error);
  }
  if (submission.grade) {
    const error = appError.create(
      "This Submission is already graded",
      400,
      "FAIL"
    );
    return next(error);
  }
  submission.grade = grade;
  submission.feedback = feedback;
  await submission.save();
  res.status(200).json({
    status: "success",
    message: "grade added successfully",
    data: {
      submission,
    },
  });
};

const updateTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  const task = await Task.findByIdAndUpdate(taskId, req.body, { new: true });
  if (!task) {
    const error = appError.create("Task Not Found", 404, "FAIL");
    return next(error);
  }
  await task.save();
  res.status(200).json({
    status: "success",
    message: "task updated successfully",
    data: {
      task,
    },
  });
};

const deleteTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    const error = appError.create("Task Not Found", 404, "FAIL");
    return next(error);
  }
  res.status(200).json({
    status: "success",
    message: "task deleted successfully",
    data: null,
  });
};

const deleteSubmission = async (req, res, next) => {
  const submissionId = req.params.submissionId;
  const taskId = req.params.taskId;
  const task = await Task.findById(taskId);
  console.log(task.deadline);
  const currentDate = new Date();
  if (task.deadline <= currentDate) {
    const error = appError.create("Deadline has passed", 400, "FAIL");
    return next(error);
  }
  const submission = await Submission.findByIdAndDelete(submissionId);
  if (!submission) {
    const error = appError.create("Submission Not Found", 404, "FAIL");
    return next(error);
  }
  res.status(200).json({
    status: "success",
    message: "submission deleted successfully",
    data: null,
  });
};
module.exports = {
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
};
