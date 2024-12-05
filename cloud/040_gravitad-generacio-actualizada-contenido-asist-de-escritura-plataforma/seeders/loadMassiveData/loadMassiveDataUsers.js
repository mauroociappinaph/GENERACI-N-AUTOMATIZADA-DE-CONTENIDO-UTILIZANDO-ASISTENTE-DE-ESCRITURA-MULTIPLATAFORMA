
export async function loadMassiveDataUsers(data) {
   const usersArray = [];
   const Users = Parse.Object.extend('users');

   data.forEach((usersData) => {
      const users = new Users();
      users.set(usersData);
      usersArray.push(users);
   });

   try {
      await Parse.Object.saveAll(usersArray);

      return {
         status: 'success',
         result: true,
         message: 'Seeding de UsersData completado con éxito.',
      };
   } catch (error) {
      throw error;
   }
}