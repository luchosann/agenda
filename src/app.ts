import express from 'express';
import cors from 'cors';
import errorHandler from './middlewares/error.middleware';
import { subdomainMiddleware } from './middlewares/subdomain.middleware';

// Importamos los nuevos enrutadores
import apiRouter from './routes/api.routes';
import businessRouter from './routes/business.routes';

const app = express();

// Middlewares globales
app.use(express.json());

// Configuración de CORS para producción
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['api.localhost:3000', 'empresa2.localhost:3000' , 'http://localhost:5173'];
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin 'origin' (como las de Postman o apps móviles)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

// 1. El middleware de subdominios se ejecuta primero para identificar el contexto
app.use(subdomainMiddleware);

// 2. Enrutamiento principal basado en el contexto (subdominio)
app.use((req, res, next) => {
  const subdomain = (req as any).subdomain;
  const business = (req as any).business;

  if (business) {
    // Si se encontró un objeto business (es un subdominio de empresa)
    return businessRouter(req, res, next);
  } else if (subdomain === 'api') {
    // Si es el subdominio 'api'
    return apiRouter(req, res, next);
  } else {
    // Si no hay subdominio o es 'www', etc., mostramos una página principal o la documentación
    return res.send('<h1>Bienvenido a la API de Agendas</h1><p>Accede a <code>api.tudominio.com</code> para la API principal o a <code>tu-empresa.tudominio.com</code> para ver los datos de tu empresa.</p>');
  }
});

// Middleware de manejo de errores, se ejecuta al final
app.use(errorHandler);

export default app;
