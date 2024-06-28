import { Router } from 'express';
import AppController from '../controllers/AppController';
const router = Router();

router.get('/status', (req, res) => {
  AppController.getStatus(req, res);
});
router.get('/stats', (req, res) => {
  res.json({ users: 10, files: 1000 });
});
