import multer from "multer";
import path from "path";
import { UPLOADS_BANNER_PATH } from "../config/paths";

const getStorage = () => {
    return multer.diskStorage({
        destination: ( req, file, cb ) => {
            cb(null, UPLOADS_BANNER_PATH);
        },
        filename: ( req, file, cb ) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    });
}

const uploadBanner = multer({ storage: getStorage() });


export default uploadBanner;