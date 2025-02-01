require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const userRouter = require("./routes/users.routes");
const taskRouter = require("./routes/tasks.routes");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const app = express();

// console.log(new Date());
// console.log(crypto.randomBytes(32).toString("hex"));

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("MongoDB connected successfully");
  app.listen(process.env.PORT, () =>
    console.log(`App listenning on port ${process.env.PORT}`)
  );
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);

//Global Error Handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || "ERROR",
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});
