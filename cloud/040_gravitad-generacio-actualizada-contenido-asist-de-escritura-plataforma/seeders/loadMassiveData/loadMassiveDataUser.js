import { createNewUserServices } from "../../modules/users/userServices";

export async function loadMassiveDataUser(data) {
    await Promise.all(
        data.map(async (objectData) => {
          try {
            return await createNewUserServices(objectData);
          } catch (error) {
            console.error(`Error al crear usuario: ${error.message}`);
            throw error;
          }
        }),
      );
      return {
         status: 'success',
         result: true,
         message: 'Seeding de UserData completado con éxito.',
      };
}