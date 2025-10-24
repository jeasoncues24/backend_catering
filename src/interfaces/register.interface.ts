export interface BodyRegisterCompany {
    identification: string;
    bussines_name: string;
    type_company_id: number;
    trade_name: string;
    phone: string;
    address: string;
    status: number;
    tax_id: number;
    logo_path?: string;
    logo_ticket?: number;
    email: string;
    user_name: string;
    password: string;
    plan_id: number;
}