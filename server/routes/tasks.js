import { Router } from 'express';
import Task from '../models/Task.js';

const router = Router();

function buildFilter(filter) {
  if (filter === 'active') return { completed: false };
  if (filter === 'completed') return { completed: true };
  return {};
}

router.get('/', async (req, res) => {
  try {
    const filter = buildFilter(req.query.filter);
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const description =
      typeof req.body.description === 'string' ? req.body.description.trim() : '';

    const task = await Task.create({ title, description });
    res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create task', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updates = {};

    if (req.body.title !== undefined) {
      const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
      if (!title) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      updates.title = title;
    }

    if (req.body.description !== undefined) {
      updates.description =
        typeof req.body.description === 'string' ? req.body.description.trim() : '';
    }

    if (req.body.completed !== undefined) {
      updates.completed = Boolean(req.body.completed);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted', id: task._id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid task id' });
    }
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

export default router;
