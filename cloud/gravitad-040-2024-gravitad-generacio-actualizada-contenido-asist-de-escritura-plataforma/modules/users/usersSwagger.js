// swaggerDocs.js

  export const getAllUsersSwagger = {
      '/functions/getAllUsers': {
        post: {
          tags: ['Users'],
          summary: 'Retrieve all users',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'integer',
                      description: 'Page number for pagination',
                      example: 1
                    }
                  },
                  required: ['page']
                }
              }
            }
          },
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    export const getUserByIdSwagger = {
      '/functions/getUserById': {
        post: {
          tags: ['Users'],
          summary: 'Retrieve user by ID',
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          requestBody: {
            description: 'ID of the user',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: {
                      type: 'string',
                      description: 'ID of the user',
                      example: 'WYSpv8cCyA'
                    }
                  },
                  required: ['userId']
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object'
                  }
                }
              }
            }
          }
        }
      }
    };
    
    export const createUserSwagger = {
      '/functions/createUser': {
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          requestBody: {
            description: 'User object that needs to be added',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    objectData: {
                      type: 'object',
                      properties: {
  userName: {
    type: "string",
    example: "user"
  },
  userEmail: {
    type: "string",
    example: "correo"
  },
  userPassword: {
    type: "string",
    example: "contraseña"
  },
  userType: {
    type: "string",
    example: "tipo de usuario"
  },
  userPhone: {
    type: "string",
    example: "nro telefonico"
  },
  userEmailVerified: {
    type: "string",
    example: "verificacion de email"
  },
  userInterests: {
    type: "string",
    example: "intereses"
  },
  userSocialNetworks: {
    type: "string",
    example: "redes sociales"
  },
  userDemographics: {
    type: "object",
    example: {
      fullName: "nombre completo",
      birthDate: "fecha de nacimiento",
      dni: "documento de identidad",
      gender: "genero",
      address: "direccion",
      country: "pais"
    }
  }
},
                      required: ['']
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User created successfully'
            }
          }
        }
      }
    };
    
    export const deleteUserSwagger = {
      '/functions/deleteUser': {
        post: {
          tags: ['Users'],
          summary: 'Delete a user',
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          requestBody: {
            description: 'ID of the user to be deleted',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: {
                      type: 'string',
                      example: 'WYSpv8cCyA'
                    }
                  },
                  required: ['userId']
                }
              }
            }
          },
          responses: {
            204: {
              description: 'User deleted successfully'
            }
          }
        }
      }
    };
    
    export const updateUserSwagger = {
      '/functions/updateUser': {
        post: {
          tags: ['Users'],
          summary: 'Update a user',
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          requestBody: {
            description: 'User object that needs to be updated',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: {
                      type: 'string',
                      example: 'WYSpv8cCyA'
                    },
                    objectData: {
                      type: 'object',
                      properties: {
  userName: {
    type: "string",
    example: "user"
  }
},
                      required: ['userId', 'objectData']
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'User updated successfully'
            }
          }
       }
     }
   };