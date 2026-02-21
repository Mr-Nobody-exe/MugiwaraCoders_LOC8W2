import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (allowedTypes) => (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) cb(null, true);
  else cb(new Error(`Only ${allowedTypes.join(', ')} files allowed`), false);
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png']),
});

export const uploadPPT = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: fileFilter(['.ppt', '.pptx', '.pdf']),
});