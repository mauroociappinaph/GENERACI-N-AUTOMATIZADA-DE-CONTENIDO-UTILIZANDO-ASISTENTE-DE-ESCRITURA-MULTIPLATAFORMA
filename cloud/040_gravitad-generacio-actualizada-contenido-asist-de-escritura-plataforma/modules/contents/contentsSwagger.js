// swaggerDocs.js

  export const getAllContentsSwagger = {
      '/functions/getAllContents': {
        post: {
          tags: ['Contents'],
          summary: 'Retrieve all contents',
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
    
    export const getContentByIdSwagger = {
      '/functions/getContentById': {
        post: {
          tags: ['Contents'],
          summary: 'Retrieve content by ID',
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          requestBody: {
            description: 'ID of the content',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    contentId: {
                      type: 'string',
                      description: 'ID of the content',
                      example: 'WYSpv8cCyA'
                    }
                  },
                  required: ['contentId']
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
    
    export const createContentSwagger = {
      '/functions/createContent': {
        post: {
          tags: ['Contents'],
          summary: 'Create a new content',
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          requestBody: {
            description: 'Content object that needs to be added',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    objectData: {
                      type: 'object',
                      properties: {},
                      required: ['']
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Content created successfully'
            }
          }
        }
      }
    };
    
    export const deleteContentSwagger = {
      '/functions/deleteContent': {
        post: {
          tags: ['Contents'],
          summary: 'Delete a content',
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          requestBody: {
            description: 'ID of the content to be deleted',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    contentId: {
                      type: 'string',
                      example: 'WYSpv8cCyA'
                    }
                  },
                  required: ['contentId']
                }
              }
            }
          },
          responses: {
            204: {
              description: 'Content deleted successfully'
            }
          }
        }
      }
    };
    
    export const updateContentSwagger = {
      '/functions/updateContent': {
        post: {
          tags: ['Contents'],
          summary: 'Update a content',
          security: [
            { sessionAuth: [] },
            { appIdAuth: [] }
          ],
          requestBody: {
            description: 'Content object that needs to be updated',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    contentId: {
                      type: 'string',
                      example: 'WYSpv8cCyA'
                    },
                    objectData: {
                      type: 'object',
                      properties: {
  undefined: {
    type: "undefined"
  }
},
                      required: ['contentId', 'objectData']
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Content updated successfully'
            }
          }
       }
     }
   };