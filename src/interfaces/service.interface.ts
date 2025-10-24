
export interface Service {
    name: string;
    duration: number;
    price: number;
    establishment_id: string;
    category_id: string;
    image?: string | null;
    status: number;
}