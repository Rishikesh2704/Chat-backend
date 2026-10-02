import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + "-" + Date.now());
  },
});

export const upload = multer({ storage: storage ,fileFilter:(req,file,cb) => {
   if(['image/png','image/jpeg'].includes(file.mimetype)){
    cb(null, true)
   }
   else cb(null, false)
}}
);
