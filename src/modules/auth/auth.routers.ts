import express from 'express';
import { authControllers } from './auth.controller';

const router = express.Router();

// Matches POST /api/v1/auth/signup
router.post('/signup', authControllers.handleRegister);

// Matches POST /api/v1/auth/signin
router.post('/signin', authControllers.handleLogin);

export const authRoutes = router;