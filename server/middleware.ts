import { Request, Response, NextFunction } from 'express';
import { Session } from 'express-session';

interface CustomSession extends Session {
  user?: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

export const requireAdmin = async (req: Request & { session: CustomSession }, res: Response, next: NextFunction) => {
  if (!req.session?.user || !req.session.user.isAdmin) {
    return res.status(401).json({ message: "Non autorisé" });
  }
  next();
}; 