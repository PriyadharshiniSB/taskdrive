const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: uuidv4 },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const TodoModel = mongoose.model('Todo', todoSchema);

class Todo {
  async createTodo(todoData) {
    const todo = new TodoModel({
      id: uuidv4(),
      text: todoData.text,
      completed: false,
      userId: todoData.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await todo.save();
    return todo.toObject();
  }

  async getTodosByUserId(userId) {
    return await TodoModel.find({ userId }).lean();
  }

  async getTodoById(id, userId) {
    return await TodoModel.findOne({ id, userId }).lean();
  }

  async toggleTodo(id, userId) {
    const todo = await TodoModel.findOne({ id, userId });
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = new Date();
      await todo.save();
      return todo.toObject();
    }
    return null;
  }

  async renameTodo(id, userId, newText) {
    const todo = await TodoModel.findOneAndUpdate(
      { id, userId },
      { text: newText, updatedAt: new Date() },
      { returnDocument: 'after' }
    ).lean();
    return todo;
  }

  async deleteTodo(id, userId) {
    const result = await TodoModel.deleteOne({ id, userId });
    return result.deletedCount > 0;
  }
}

module.exports = new Todo();