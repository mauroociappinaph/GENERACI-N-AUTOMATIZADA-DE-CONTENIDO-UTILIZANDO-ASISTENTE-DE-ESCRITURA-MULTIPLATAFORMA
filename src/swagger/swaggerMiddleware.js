import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { getRegisteredTags } from './swaggerTags.js';
//import * as User from '../../cloud/083_DESARROLLO-DE-UNA-SOLUCIÓN-INTEGRAL-PARA-LA-COMUNICACIÓN-Y-POSICIONAMIENTO-DE-LA-EMPRESA/modules/users/userSwagger.js';


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parse API',
      version: '1.0.0',
      description: 'API documentation for Parse Server'
    },
    servers: [
      {
        url: 'http://localhost:2337/server',
        description: 'Main Server'
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Parse-Session-Token',
          description: 'Session token for Parse Server authentication'
        },
        appIdAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Parse-Application-Id',
          description: 'Application ID for Parse Server'
        }
      }
    },
    security: [
      {
        sessionAuth: [],
        appIdAuth: []
      }
    ],
    tags: getRegisteredTags()
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

const addSwaggerPaths = (spec, ...definitions) => {
  definitions.forEach(definition => {
    Object.keys(definition).forEach(key => {
      const pathDefinitions = definition[key];
      Object.keys(pathDefinitions).forEach(path => {
        const methods = pathDefinitions[path];
        if (!spec.paths[path]) {
          spec.paths[path] = {};
        }
        Object.keys(methods).forEach(method => {
          spec.paths[path][method] = methods[method];
        });
      });
    });
  });
};

addSwaggerPaths(swaggerSpec);

swaggerSpec.paths['/login'] = {
  post: {
    tags: ['User'],
    summary: 'Login',
    description: 'Login to the application',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: { type: 'string' },
              password: { type: 'string' }
            },
            required: ['username', 'password']
          }
        }
      }
    },
    responses: {
      200: {
        description: 'Successful login',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                sessionToken: { type: 'string' }
              }
            }
          }
        }
      },
      401: {
        description: 'Invalid credentials'
      }
    }
  }
};

export const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};