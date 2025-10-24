import { Router } from "express";
import { readdirSync } from "fs"; 

const PATH_ROUTER = `${__dirname}`; 
const router = Router();

const cleanFileName = (fileName:string) => {
    const file = fileName.split('.').shift(); // ( remueve .ts )
    return file;
}

const loadRoutes = async () => {
    const files = readdirSync(PATH_ROUTER);
    
    for (const fileName of files) {
        const cleanName = cleanFileName(fileName);
        if (cleanName !== "index") {
            try {
                const moduleRouter = await import(`./${cleanName}`);
                router.use(`/api/v1/${cleanName}`, moduleRouter.router);
            } catch (error) {
                console.error(`Error loading route ${cleanName}:`, error);
            }
        }
    }
};

loadRoutes();

export { router };