import { seedCoins } from "./coins.seeder";
import { seedCompany } from "./company.seeder";
import { seedCompanyTypes } from "./companyTypes.seeder";
import { seedRoles } from "./roles.seeder";
import { seedTaxes } from "./taxes.seeder";
import { seedUsers } from "./user.seeder";

async function main() {
    try {
        await seedRoles();
        await seedCompanyTypes();
        await seedCoins();
        await seedTaxes();
        await seedCompany();
        await seedUsers();
        console.log("Corriendo ok seeders.")

    } catch ( error ) {
        console.error('Error running seeders:', error);
        process.exit(1);
    }
}

main();