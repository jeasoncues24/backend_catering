import multer from "multer";
import path from "path";
import fs from "fs";
import { UPLOADS_PRODUCTS_PATH } from "../config/paths";

const getStorage = () => {
    return multer.diskStorage({
        destination: ( req, file, cb ) => {

            if (!fs.existsSync(UPLOADS_PRODUCTS_PATH)) {
                fs.mkdirSync(UPLOADS_PRODUCTS_PATH, { recursive: true });
            }

            cb(null, UPLOADS_PRODUCTS_PATH);
        },
        filename: ( req, file, cb ) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    });
}

const uploadProducts = multer({ storage: getStorage() });


export default uploadProducts;