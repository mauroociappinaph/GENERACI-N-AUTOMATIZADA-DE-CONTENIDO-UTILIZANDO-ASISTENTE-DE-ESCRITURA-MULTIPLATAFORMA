const path = require('path');
const fs = require('fs');
const { loadEnvFile } = require('process');

const PATH_NAME = path.join(__dirname, '../modules/');

fs.readdirSync(PATH_NAME).forEach((folder) => {
  const folderPath = path.join(PATH_NAME, folder);
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    if (file.endsWith('Clouds.js')) {
      const filePath = path.join(folderPath, file);
      require(filePath);
    }
  });
});
console.log('servidor iniciado');
