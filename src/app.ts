import "dotenv/config";
import express from "express";
import cors from "cors";
import { router } from "./routes";
import { UPLOADS_PATH } from "./config/paths";

const app = express();
const corsOptions = {
    origin: [
        'http://localhost:3000'
    ],
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization']
};


app.use(cors(corsOptions));


if (process.env.NODE_ENV !== "production") {
    app.use("/uploads", express.static(UPLOADS_PATH));
}

app.use(express.json());
app.use(router);

export { app };