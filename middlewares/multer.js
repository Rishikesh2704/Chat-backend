import multer from "multer";
import path from 'path'
export const upload = multer({
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => checkFileType(file, cb),
});

function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimeType);
  if ((extName, mimeType)) {
    return cb(null, true);
  } else return cb("Error: Images only of type jpeg, png, gif, jpg");
}
