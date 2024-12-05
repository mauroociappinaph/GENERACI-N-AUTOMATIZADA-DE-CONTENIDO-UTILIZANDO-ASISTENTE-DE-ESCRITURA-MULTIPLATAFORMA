/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import fs from 'fs/promises';
import path from 'path';
import { tablesToLoad } from '../seeders/tables';

// Función para cargar datos de una tabla específica
async function loadDataForTable(tableName, filePath, loadMassiveDataFunction) {
  try {
    const rootDir = process.cwd();
    const absoluteFilePath = path.join(rootDir, filePath);

    const data = await fs.readFile(absoluteFilePath, 'utf-8');
    const parsedData = JSON.parse(data);
    const result = await loadMassiveDataFunction(parsedData);

    if (result.status !== 'success') {
      throw new Error(`Error loading data for the table ${tableName}: ${result.errorDetails?.message}`);
    }

    return true;
  } catch (error) {
    console.error(`Error during data loading for the table ${tableName}: ${error.message}`);
    throw error;
  }
}

export async function loadAllData() {
  try {
    // Función recursiva para cargar datos en orden
    const loadTableDataSequentially = async (index) => {
      if (index >= tablesToLoad.length) {
        return;
      }

      const { tableName, filePath, loadFunction } = tablesToLoad[index];
      const success = await loadDataForTable(tableName, filePath, loadFunction);
      if (!success) {
        throw new Error(`Error loading data for the table ${tableName}`);
      }

      // Llamada recursiva para cargar la siguiente tabla
      await loadTableDataSequentially(index + 1);
    };

    // Comenzar la carga de datos secuencialmente
    await loadTableDataSequentially(0);

    return {
      status: 'success',
      result: true,
      message: 'All data loading completed successfully.',
    };
  } catch (error) {
    console.error(`Error during data loading: ${error.message}`);
    throw error;
  }
}
