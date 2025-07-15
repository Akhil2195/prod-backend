import multer, { diskStorage } from "multer";
import { extname as _extname } from "path";

// Set storage engine
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/temp");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${_extname(file.originalname)}`);
  },
});

// File type filter
function fileFilter(req, file, cb) {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(_extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"));
  }
}

// Limits
const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB limit
};

// Multer upload instance
const upload = multer({
  storage : multer.memoryStorage(),
  fileFilter,
  limits,
});

export default upload;
