import { NextFunction, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || 'tokencatering.01';


const generateToken = (id: string) => {
    const jwt = sign({ id },  JWT_SECRET, {
        expiresIn: "2h"
    });
    return jwt;
}

export const generateRefreshToken = (id: string) => {
    const jwt = sign({ id },  JWT_SECRET, {
        expiresIn: "7d"
    });
    return jwt;
    // return jwt.sign({ id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

const verifyToken = (token: string) => {
    try {
        const decoded = verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ status: 401, message: "Token is required, unauthorized access" });
            return;
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: "Invalid token format" });
            return;
        }

        const decoded = verify(token, JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
}

export { generateToken, verifyToken, verifyTokenMiddleware };
