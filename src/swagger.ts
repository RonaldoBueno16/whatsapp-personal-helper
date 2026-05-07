import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp Personal Helper API',
      version: '1.0.0',
      description: 'API para disparar ações no WhatsApp via whatsapp-web.js',
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
    security: [{ BearerAuth: [] }],
    servers: [{ url: '/' }],
  },
  apis:
    process.env.NODE_ENV === 'production'
      ? ['./dist/routes/*.js', './dist/server.js']
      : ['./src/routes/*.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
