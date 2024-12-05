/* eslint-disable etc/no-commented-out-code */
/* eslint-disable no-else-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import axios from 'axios';
import { createAdvice } from '../controllers/adviceControllers';
import config from '../../../src/config';

export async function sendToIaEndpoint(objectData, Parse) {
  const bodyIa = {
    uid: '200_backend',
    user: 'backend',
    description: 'Petición realizada desde el backend del proyecto 200',
    data: {
      id_params: '200',
      view_name: 'dataAIRecommendation',
      n_token: 1,
      prompts: {},
      outputs: [],
      filters: [],
    },
  };

  const jsonString = JSON.stringify(bodyIa);

  try {
    // Realizar la solicitud POST a la API de recomendación
    const recommendationResponse = await axios.post(config.IA_URI, jsonString, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Verificar si la solicitud fue exitosa
    if (recommendationResponse.status === 200) {
      return recommendationResponse.output;
    } else {
      // Devolver algún valor o lanzar un error en caso de que la solicitud no sea exitosa
      throw new Parse.Error(
        Parse.Error.OPERATION_FORBIDDEN,
        'The POST request to the recommendation API was not successful',
      );
    }
  } catch (error) {
    console.error(`Error making the POST request to the recommendation API: ${error}`);
    // Puedes optar por devolver un valor específico en caso de error
    throw error;
  }
}
