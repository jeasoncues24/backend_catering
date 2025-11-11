import { prisma } from "../config/db";
import { Service } from "../interfaces/service.interface";
import { getEstablishmentByIdRepository } from "../repositories/branches.repository";
import { addServiceRepository, createServiceColaborador, createServiceProduct, deleteServiceById, getServiceById, getServiceByName, getServicesListRepository, listActivesServicesByEstablishment, listColaboresService, listServicesForQuotes, updateServiceById } from "../repositories/service.repository";


// export const amarrarProductosService = async (data: {
//   productId: string;
//   serviceId: string;
//   status: number;
// }) => {
//   if (!data.productId || !data.serviceId) {
//     throw new Error("Faltan datos obligatorios: productId o serviceId");
//   }

//   // Puedes validar si ya existe la relación
//   // (para evitar duplicados)
//   // Ejemplo:
//   // const existing = await prisma.serviceProduct.findFirst({
//   //   where: { productId: data.productId, serviceId: data.serviceId },
//   // });
//   // if (existing) throw new Error("Este producto ya está asociado a este servicio.");

//   const serviceProduct = await createServiceProduct(data);

//   return serviceProduct;
// };
export const amarrarProductosService = async (data: {
  productId: string;
  serviceId: string;
  status: number;
}) => {
  if (!data.productId || !data.serviceId) {
    throw new Error("Faltan datos obligatorios: productId o serviceId");
  }

  // Utilizamos upsert: Si la relación ya existe, no hace nada (o la actualiza).
  // Si no existe, la crea. Esto garantiza la unicidad y evita errores de duplicado.
  const serviceProduct = await prisma.productService.upsert({
    where: {
      // Necesitas una restricción @unique([productId, serviceId]) en tu modelo Prisma 
      // para que esta cláusula 'where' funcione correctamente con una clave compuesta.
      productId_serviceId: {
        productId: data.productId,
        serviceId: data.serviceId,
      },
    },
    update: { 
      // Opcional: Si quieres asegurarte de que el status siempre sea 1 cuando se "re-vincula"
      status: data.status, 
    }, 
    create: {
      productId: data.productId,
      serviceId: data.serviceId,
      status: data.status,
    },
  });

  return serviceProduct;
};

export const desvincularProductosService = async (productId: string, serviceId: string) => {
    if (!productId || !serviceId) {
        throw new Error("Faltan datos obligatorios: productId o serviceId para desvincular");
    }

    // Busca y elimina el registro único
    const deletedRelation = await prisma.productService.delete({
        where: {
            productId_serviceId: {
                productId: productId,
                serviceId: serviceId,
            },
        },
    });

    return deletedRelation;
};

export const getLinkedProductsByServiceId = async (serviceId: string) => {
    if (!serviceId) {
        throw new Error("serviceId es obligatorio para listar vínculos.");
    }
    
    // 1. Busca todos los vínculos para ese serviceId
    const linkedRelations = await prisma.productService.findMany({
        where: { serviceId },
        // 2. Incluimos los datos del producto para que el frontend los pueda mostrar si es necesario,
        // aunque el frontend solo use el ID.
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    // Añade aquí cualquier otro campo que el frontend pueda necesitar
                }
            }
        }
    });

    // Devolvemos el array de productos (o el objeto de vínculo si prefieres)
    // El frontend espera un array de objetos que contengan el 'productId' o 'id'
    return linkedRelations.map(rel => ({
        // Esta es la clave que el frontend mapea a IDs seleccionados:
        productId: rel.productId, 
        name: rel.product.name // Dato extra
    }));
};

export const listColaboradorService = async ( serviceId: string ) => {
    return await listColaboresService(serviceId)
}

export const amarrarColaboradorService = async (data: {
  colaboradorId: string;
  serviceId: string;
  status: number;
}) => {
  if (!data.colaboradorId || !data.serviceId) {
    throw new Error("Faltan datos obligatorios: colaboradorId o serviceId");
  }

  const serviceProduct = await createServiceColaborador(data);

  return serviceProduct;
};

export const addServiceS = async ( data: Partial<Service> ) => {

    if ( !data.name || !data.duration || !data.price || !data.establishment_id || !data.status ) {
        throw new Error("Debe enviar los campos obligatorios.");
    }

    // Validar de que el precio sea mayor a 0
    if ( data.price <= 0 ) {
        throw new Error("El precio es menor o igual a 0")
    }

    // Validar de que el nombre no exista
    const isService = await getServiceByName(data.name, data.establishment_id);

    if ( isService ) {
        throw new Error("El servicio ya existe en la sucursal.")
    }

    // Guardar servicio si no existe
    const newService = await addServiceRepository(data)
    return newService;
    
}

export const getServiceListS = async ( establishment_id: string ) => {

    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    // Validar de que el id de la sucursal exista y este activa
    const establishment_idExist = await getEstablishmentByIdRepository(establishment_id);

    if ( !establishment_idExist ) {
        throw new Error("La sucursal no existe o no esta activa");
    }

    const listServices = await getServicesListRepository(establishment_id);

    return listServices;
}


export const deleteServiceS = async ( id: string ) => {

    if ( !id ) {
        throw new Error("El id del servicio es obligatorio");
    }

    // Validar de que el id exista
    const service = await getServiceById(id);
    
    if ( !service ) {
        throw new Error("El id del servicio no existe");
    }

    // Eliminar el servicio
    const deleteService = await deleteServiceById(id);
    return deleteService;
}

export const listActivesService = async ( establishment_id: string ) => {

    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    // Validar de que el id de la sucursal exista y este activa
    const establishment_idExist = await getEstablishmentByIdRepository(establishment_id);

    if ( !establishment_idExist ) {
        throw new Error("La sucursal no existe o no esta activa");
    }

    const responseData = await listActivesServicesByEstablishment(establishment_id);
    return responseData;

}

export const listServicesForQuotesService = async ( establishment_id: string, category_id: string ) => {
    if ( !establishment_id ) {
        throw new Error("El id sucursal es obligatorio");
    }

    // Validar de que el id de la sucursal exista y este activa
    const establishment_idExist = await getEstablishmentByIdRepository(establishment_id);

    if ( !establishment_idExist ) {
        throw new Error("La sucursal no existe o no esta activa");
    }

    // Si category_id es 'todas', null, undefined o vacío, lo pasamos como ""
    const categoryParam = (!category_id || category_id === 'todas') ? "" : category_id;
    const listServicesForCategory = await listServicesForQuotes(establishment_id, categoryParam);

    return listServicesForCategory;
}

export const updateServiceS = async ( id: string, data: Partial<Service> ) => {
    if ( !id ) {
        throw new Error("El id del servicio es obligatorio");
    }

    // Validar que el servicio exista
    const service = await getServiceById(id);
    if ( !service ) {
        throw new Error("El servicio no existe");
    }

    // Si se actualiza el nombre, validar que no exista otro servicio con ese nombre en la misma sucursal
    if (data.name && data.establishment_id) {
        const existing = await getServiceByName(data.name, data.establishment_id);
        if (existing && existing.id !== id) {
            throw new Error("Ya existe un servicio con ese nombre en la sucursal.");
        }
    }

    // Validar precio si se actualiza
    if (data.price !== undefined && data.price <= 0) {
        throw new Error("El precio es menor o igual a 0");
    }

    const updatedService = await updateServiceById(id, data);
    return updatedService;
}