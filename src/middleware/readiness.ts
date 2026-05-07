import { Request, Response, NextFunction } from 'express';
import { isReady } from '../whatsapp/client';

export function readinessGate(_req: Request, res: Response, next: NextFunction): void {
  if (!isReady) {
    res.status(503).json({ error: 'whatsapp not ready' });
    return;
  }
  next();
}
