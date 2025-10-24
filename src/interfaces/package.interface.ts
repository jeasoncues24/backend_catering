export interface IGift {
    id: string;
    name: string;
    description: string;
    image: string;
    type: string;
}

export interface ICreatePackage {
    id: string;
    name: string;
    eventType: string;
    description: string;
    costPerPerson: number;
    numberOfPeople: number;
    location: string;
    services: Array<{ id: string, quantity: number }>;
    products: Array<{ id: string, quantity: number }>;
    includesGift: boolean;
    gift?: Array<{ id: string, quantity: number }>;
}