import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import {
  getProjectsByUser,
  createProject,
  deleteProject,
} from '../services/projectService';

const router = Router();

router.use(authMiddleware);

// GET /projects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const projects = await getProjectsByUser(req.userId!);
    res.json({ projects });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// POST /projects
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, prompt } = req.body;
    if (!title || !prompt) {
      res.status(400).json({ message: 'Title and prompt are required' });
      return;
    }
    const project = await createProject(req.userId!, title, prompt);
    res.status(201).json({ project });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// DELETE /projects/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await deleteProject(req.userId!, req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

export default router;
