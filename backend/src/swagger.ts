import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Primetrade Task API',
      version: '1.0.0',
      description:
        'A scalable REST API with JWT Authentication and Role-Based Access Control (RBAC). Built with Node.js, Express, TypeScript, Drizzle ORM, and PostgreSQL.',
    },
    servers: [{ url: '/api/v1', description: 'Local development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the JWT token returned from the Login endpoint.',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Finish the assignment' },
            description: { type: 'string', example: 'Submit by Friday', nullable: true },
            isCompleted: { type: 'boolean', example: false },
            userId: { type: 'integer', example: 1 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Validation Error' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        MessageResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Server health check' },
      { name: 'Auth', description: 'Register and login endpoints' },
      { name: 'Tasks', description: 'CRUD operations for tasks (requires JWT)' },
    ],
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'API is running',
              content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' }, message: { type: 'string', example: 'API is running' } } } } },
            },
          },
        },
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          description: 'Creates a new user account with the `user` role. Admin accounts are created via the seed script.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', minLength: 2, maxLength: 255, example: 'John Doe' },
                    email: { type: 'string', format: 'email', example: 'john@example.com' },
                    password: { type: 'string', minLength: 6, maxLength: 128, example: 'password123' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'User registered successfully' },
                      user: { $ref: '#/components/schemas/User' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            409: { description: 'Email already in use', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and get a JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'admin@primetrade.ai' },
                    password: { type: 'string', example: 'admin123' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Login successful' },
                      user: { $ref: '#/components/schemas/User' },
                      token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    },
                  },
                },
              },
            },
            400: { description: 'Validation error' },
            401: { description: 'Invalid credentials' },
            500: { description: 'Internal server error' },
          },
        },
      },
      '/tasks': {
        get: {
          tags: ['Tasks'],
          summary: 'Get tasks',
          description: '**Users** → returns only their own tasks.\n\n**Admins** → returns all tasks from all users, with author info.',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of tasks', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } } } } },
            401: { description: 'Unauthorized – missing or invalid token' },
          },
        },
        post: {
          tags: ['Tasks'],
          summary: 'Create a new task',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string', minLength: 1, maxLength: 255, example: 'Finish assignment' },
                    description: { type: 'string', maxLength: 1000, nullable: true, example: 'Submit the PrimeTrade backend task' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Task created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
            400: { description: 'Validation error' },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/tasks/{id}': {
        get: {
          tags: ['Tasks'],
          summary: 'Get a task by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
          responses: {
            200: { description: 'Task found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
            403: { description: 'Forbidden – users can only access their own tasks' },
            404: { description: 'Task not found' },
            401: { description: 'Unauthorized' },
          },
        },
        put: {
          tags: ['Tasks'],
          summary: 'Update a task',
          description: 'Users can update their own tasks. Admins can update any task.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'Updated title' },
                    description: { type: 'string', nullable: true, example: 'Updated description' },
                    isCompleted: { type: 'boolean', example: true },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Task updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } },
            400: { description: 'Validation error' },
            403: { description: 'Forbidden' },
            404: { description: 'Task not found' },
          },
        },
        delete: {
          tags: ['Tasks'],
          summary: 'Delete a task',
          description: 'Users can delete their own tasks. Admins can delete any task.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 1 } }],
          responses: {
            200: { description: 'Task deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
            403: { description: 'Forbidden' },
            404: { description: 'Task not found' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
