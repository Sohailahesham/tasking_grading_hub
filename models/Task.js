const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  deadline: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Task", taskSchema);
