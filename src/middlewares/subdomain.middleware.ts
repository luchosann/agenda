import { Request, Response, NextFunction } from 'express';
import * as businessServices from '../services/business.services';

// Subdominios reservados que no deben ser tratados como slugs de empresas
const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'app'];

// Extendemos el tipo Request de Express para incluir nuestras propiedades personalizadas
interface CustomRequest extends Request {
  subdomain?: string;
  business?: any; // Deberíamos usar un tipo más específico, como el modelo de Prisma
}

export const subdomainMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const host = req.hostname;

  // Usamos una expresión regular para ser más flexibles con el dominio base (ej. localhost, midominio.com, midominio.com.ar)
  const domainParts = host.split('.');
  
  // Si hay menos de 2 partes (ej. 'localhost') o el host es una IP, no hay subdominio.
  if (domainParts.length < 2 || req.ip === host) {
    return next();
  }

  // Extraemos el subdominio (la primera parte)
  const subdomain = domainParts[0];
  req.subdomain = subdomain;

  // Si es un subdominio reservado o no hay subdominio, pasamos al siguiente middleware
  // || domainParts.length < 3
  if (RESERVED_SUBDOMAINS.includes(subdomain) ) {
    return next();
  }

  // Si no es un subdominio reservado, lo tratamos como un slug de empresa
  try {
    const business = await businessServices.getBusinessByIdOrSlug(subdomain);

    if (!business) {
      // Si no se encuentra la empresa, devolvemos un 404
      return res.status(404).json({ error: `La empresa '${subdomain}' no existe o no está disponible.` });
    }

    // ¡Éxito! Adjuntamos la información de la empresa a la solicitud
    req.business = business;
    
    // Para compatibilidad con las rutas existentes, también poblamos req.params.businessId
    req.params.businessId = business.id;
    
    return next();

  } catch (error) {
    // Manejo de errores inesperados durante la búsqueda de la empresa
    console.error('Error in subdomain middleware:', error);
    return res.status(500).json({ error: 'Error interno al procesar la solicitud.' });
  }
};
