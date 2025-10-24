import bcrypt from "bcryptjs";
import { User } from "../interfaces/user.interface";
import { createUser, findUserByEmail, findUserByEmailActive, saveRefreshTokenToUser } from "../repositories/user.repository";
import { verified } from "../utils/bcrypt.handle";
import { generateRefreshToken, generateToken } from "../utils/jwt.handle";


export const registerService = async( data: User ) => {
    
    // Validaciones
    if ( !data.email || !data.password ) throw new Error("Campos obligatorios");

    // Validar si es que el correo ya existe
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
      throw new Error("El correo ya está registrado");
    }
    
    // Hashear pass
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const newUser = await createUser({
        ...data,
        password: hashedPassword
    });

    return newUser;
}



export const loginService = async( data: { email: string, password: string } ) => {
    if ( !data.email || !data.password ) {
        throw new Error("El email y contraseña son obligatorios");
    }

    // Validar de que el usuario exista
    const isExistUser = await findUserByEmailActive(data.email)

    if ( !isExistUser ) {
        throw new Error("El usuario no existe");
    }

    // Verificar que el password sea correcto
    const passwordHash = isExistUser.password;
    const isCorrect = await verified(data.password, passwordHash);

    if ( !isCorrect ) {
        throw new Error("La contraseña es incorrecta");
    }

   
    const token = generateToken(isExistUser.email);
    const refreshToken = generateRefreshToken(isExistUser.email);

    // TODO: GUARDAR TOKEN REFRESH
    await saveRefreshTokenToUser(isExistUser.id, refreshToken);

    let redirectEstablishment = null; 

    if (  isExistUser.role_id === 3 || isExistUser.role_id === 4 ) {
        redirectEstablishment = isExistUser.establishment;
        if ( !redirectEstablishment ) {
            throw new Error("No tienes una sucursal asignada, comunicate con tu administrador");
        }
    } else if ( isExistUser.role_id === 1 || isExistUser.role_id === 2 ) {
        redirectEstablishment = isExistUser.company?.establishment[0] || null;
    }


    const response = {
        token,
        refreshToken, 
        user: {
            ...isExistUser,
            company: isExistUser.company ? {
                id: isExistUser.company.id,
                bussines_name: isExistUser.company.bussines_name,
                trade_name: isExistUser.company.trade_name,
                identification: isExistUser.company.identification,
                firstEstablishment: redirectEstablishment
            } : null
        }
    }

    return response;
}