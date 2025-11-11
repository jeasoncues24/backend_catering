export interface Establishment {
    // name: string;
    // city: number;
    // province: number;
    // district: number;
    // companyId: string;
    // token?: string;
    // status: number;
    // banner_path?: string;
    name: string
    city: number
    province: number 
    district: number
    token: string
    correlativo_factura: number
    correlativo_boleta: number 
    serie_factura: string 
    serie_boleta: string 
    company_id: string
    status: number
    created_at: string
    updated_at: string
}