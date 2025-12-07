import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const auth = (requiredRoles?: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;

            // 1. Check if token exists
            if (!token) {
                throw new Error('You are not authorized!');
            }

            // 2. Extract token safely
            // We explicitly cast or check to ensure it's a string
            const tokenValue = token.startsWith('Bearer ')
                ? token.split(' ')[1]
                : token;

            if (!tokenValue) {
                throw new Error('Invalid token format');
            }
            // 3. Verify Token
            const decoded = jwt.verify(
                tokenValue,
                process.env.JWT_ACCESS_SECRET as string
            ) as JwtPayload;

            // 4. Role Authorization
            if (requiredRoles && !requiredRoles.includes(decoded.role)) {
                throw new Error('You have no access to this route');
            }

            req.user = decoded;
            next();
        } catch (err) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized Access',
            });
        }
    };
};