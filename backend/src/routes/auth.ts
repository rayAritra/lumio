import { Router, Request, Response } from 'express';
import { createUser, verifyUser, toSafeUser, getUserById } from '../services/authService';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const user = await createUser(name, email, password);
    const token = generateToken(user.id);

    res.status(201).json({ token, user: toSafeUser(user) });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await verifyUser(email, password);
    const token = generateToken(user.id);

    res.json({ token, user: toSafeUser(user) });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
});

// GET /auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserById(req.userId!);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ user: toSafeUser(user) });
  } catch (err: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
