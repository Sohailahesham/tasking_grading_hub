const multer = require("multer");

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const fileName = `submession-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = file.mimetype.split("/")[1];
  if (ext === "pdf") {
    return cb(null, true);
  } else {
    return cb(appError.create("file must be a pdf", 400, "FAIL"), false);
  }
};

const upload = multer({ storage: diskStorage, fileFilter });

module.exports = upload;
