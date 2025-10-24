export interface User {
    email: string;
    password: string;
    name: string;
    role: number;
    companyId?: string;
    status: number;
    establishmentId?: string;
}