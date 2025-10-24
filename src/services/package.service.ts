import { ICreatePackage } from "../interfaces/package.interface";
import { addPackage, addPackageForProduct, addPackageForService, addPackageGifts, detailForProforma, getPackageById, getPackagesByEstablishment, informationPackage, updatePackageDetails } from "../repositories/package.repository";

export const addPackageService = async ( packageData: { name: string; description: string; quantity_person: number; price_person: any; event_id: string; local_id: string; isGift: number, establishment_id: string } ) => { 

    const requiredKeys = [
        'name', 
        'description', 
        'quantity_person', 
        'price_person', 
        'event_id', 
        'local_id', 
        'isGift', 
        'establishment_id'
    ];

    const missingData = requiredKeys.some(key => packageData[key as keyof typeof packageData] === null || packageData[key as keyof typeof packageData] === undefined);


    if ( 
        !packageData.name || 
        !packageData.description || 
        !packageData.quantity_person || 
        !packageData.price_person || 
        !packageData.event_id || 
        !packageData.local_id || 
        !packageData.establishment_id ||
        (packageData.isGift === null || packageData.isGift === undefined) 
    ) {
        throw new Error("Faltan datos obligatorios");
    }

    return await addPackage( packageData );
}


export const getPackagesByEstablishmentService = async ( establishment_id: string ) => { 
    if ( !establishment_id ) {
        throw new Error("El ID del establecimiento es obligatorio");
    }

    return await getPackagesByEstablishment(establishment_id)
}

export const informationPackageService = async ( id: string ) => {
    if ( !id ) {
        throw new Error("El id del paquete es obligatorio")
    }


    return await informationPackage(id)
}

export const detailForProformaService = async ( id: string ) => {
    if ( !id ) {
        throw new Error("El id del paquete es obligatorio");
    }

    return await detailForProforma(id);
}

const extractGiftId = (giftId: string): string => {
    return giftId.replace('product-', '').replace('service-', '');
};

export const createPackageService = async ( data: ICreatePackage ) => {

    console.log(data)

    // Validar de que venga el id del paquete
    if ( !data.id ) {
        throw new Error("El id del paquete es obligatorio")
    }

    // Validar de que exista y este activo el paquete.
    const packageService = await getPackageById(data.id);

    if ( !packageService ) {
        throw new Error("El paquete no existe o no esta activo.")
    }


    // Actualizar package id 
    const packageUpdate = await updatePackageDetails(data.id);

    if ( !packageUpdate ) {
        throw new Error("Ocurrio un error vuelve a intentarlo.")
    }

    if (data.services && data.services.length > 0) {
        const packageServices = data.services.map((service) => ({
            packageId: packageService.id,
            serviceId: service.id,
            quantity: service.quantity
        }));

        await addPackageForService(packageServices)
    }

    if ( data.products && data.products.length > 0 ) {
        const packageProducts = data.products.map((prod) => ({
            packageId: packageService.id,
            productId: prod.id,
            quantity: prod.quantity
        }));

        await addPackageForProduct(packageProducts)
    }

    if (data.includesGift && data.gift && data.gift.length > 0) {
        const packageGifts: Array<{
            package_id: string;
            product_id?: string;
            service_id?: string;
        }> = data.gift.map((gift: any) => {
            const realId = extractGiftId(gift.id);

            if (gift.type === 'Producto') {
                return {
                    package_id: packageService.id,
                    product_id: realId,
                    quantity: gift.quantity
                };
            } else {
                return {
                    package_id: packageService.id,
                    service_id: realId,
                    quantity: gift.quantity
                };
            }
        });

        await addPackageGifts(packageGifts);
    }

    return {
        success: true, 
        data: packageService
    }
}

