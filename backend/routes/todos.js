const express = require('express');
const auth = require('../middleware/auth');
const TodoModel = require('../models/Todo');

const router = express.Router();


router.get('/', auth, async (req, res) => {
  try {
    const todos = await TodoModel.getTodosByUserId(req.user.id);
    res.json({ todos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get todos' });
  }
});


router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Todo text is required' });
    }

    const todo = await TodoModel.createTodo({
      text: text.trim(),
      userId: req.user.id
    });

    res.status(201).json({ message: 'Todo created successfully', todo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});


router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const todo = await TodoModel.toggleTodo(req.params.id, req.user.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo updated successfully', todo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});


router.patch('/:id/rename', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Todo text is required' });
    }
    const todo = await TodoModel.renameTodo(req.params.id, req.user.id, text.trim());
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo renamed successfully', todo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to rename todo' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await TodoModel.deleteTodo(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

module.exports = router;