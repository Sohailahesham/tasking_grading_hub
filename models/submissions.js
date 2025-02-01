const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const subSchema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  studentEmail: {
    type: String,
  },
  fileUrl: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: new Date(),
  },
  grade: {
    type: Number,
    min: 0,
    max: 100,
  },
  feedback: {
    type: String,
  },
});

module.exports = mongoose.model("Submission", subSchema);
