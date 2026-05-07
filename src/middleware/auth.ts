import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

const expectedAuthHeader = `Bearer ${config.apiSecret}`;

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // const header = req.headers.authorization;
  // if (!header || header !== expectedAuthHeader) {
  //   res.status(401).json({ error: 'unauthorized' });
  //   return;
  // }
  next();
}
