import multer from 'multer';

// multer store
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check the file's MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error('Unsupported file type!'), false);
  }
};

const upload = multer({ storage, fileFilter }).single('image');

export default upload;
