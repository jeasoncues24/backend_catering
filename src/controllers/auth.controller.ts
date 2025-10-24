import { Request, Response } from "express"
import { loginService, registerService } from "../services/auth.service";
import jwt from 'jsonwebtoken';
import { findUserByEmailActiveToken } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt.handle";
const JWT_SECRET = process.env.JWT_SECRET || 'tokencatering.01';


const registerController = async ( req: Request, res: Response ) => {
    try {
        const { body } = req;
        const response = await registerService(body);
        return res.status(201).json({ status: 201, message: "Usuario registrado" });

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `Ocurrio un error ${ error }`
        })
    }
}



const loginController = async ( req: Request, res: Response ) => {
    try {
        const { email, password } = req.body;
        
        const responseUser = await loginService({ email, password });
        return res.status(200).json({
            status: 200,
            data: responseUser
        });
    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `Ocurrio un error ${ error }`
        })
    }
}

const refreshTokenController = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token requerido' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as { email: string };
        
        const user = await findUserByEmailActiveToken(decoded.email);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Refresh token inválido' });
        }

        const newAccessToken = generateToken(decoded.email);
        res.json({ accessToken: newAccessToken });

    } catch (err) {
        res.status(403).json({ message: 'Refresh token inválido o expirado' });
    }
};


export {
    registerController,
    loginController,
    refreshTokenController
}
