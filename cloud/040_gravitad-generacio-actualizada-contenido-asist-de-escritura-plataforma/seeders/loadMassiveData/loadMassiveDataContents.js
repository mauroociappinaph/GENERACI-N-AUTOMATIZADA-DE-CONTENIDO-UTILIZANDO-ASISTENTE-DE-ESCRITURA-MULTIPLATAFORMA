
export async function loadMassiveDataContents(data) {
   const contentsArray = [];
   const Contents = Parse.Object.extend('contents');

   data.forEach((contentsData) => {
      const contents = new Contents();
      contents.set(contentsData);
      contentsArray.push(contents);
   });

   try {
      await Parse.Object.saveAll(contentsArray);

      return {
         status: 'success',
         result: true,
         message: 'Seeding de ContentsData completado con éxito.',
      };
   } catch (error) {
      throw error;
   }
}