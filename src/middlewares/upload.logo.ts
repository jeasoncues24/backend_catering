import multer from "multer";
import path from "path";
import fs from "fs";
import { UPLOADS_LOGOS_PATH } from "../config/paths";

const getStorage = () => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Verifica si la carpeta existe, si no la crea
      if (!fs.existsSync(UPLOADS_LOGOS_PATH)) {
        fs.mkdirSync(UPLOADS_LOGOS_PATH, { recursive: true });
      }

      cb(null, UPLOADS_LOGOS_PATH);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });
};

const uploadLogo = multer({ storage: getStorage() });

export default uploadLogo;
