import React, { useState, useEffect, useCallback } from 'react';
import { todosAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Pencil, Check, Search, X } from 'lucide-react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [filter, setFilter] = useState('all');
  // Text typed into the search box
  const [searchTerm, setSearchTerm] = useState('');

  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await todosAPI.getTodos();
      setTodos(response.data.todos);
    } catch (error) {
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodoText.trim()) {
      toast.error('Please enter a task');
      return;
    }
    try {
      await todosAPI.createTodo(newTodoText.trim());
      setNewTodoText('');
      loadTodos();
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleToggle = async (id) => {
    try {
      await todosAPI.toggleTodo(id);
      loadTodos();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await todosAPI.deleteTodo(id);
      toast.success('Task deleted');
      loadTodos();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Deletes every completed task one by one, then refreshes the list
  const handleClearCompleted = async () => {
    const completedTodos = todos.filter((t) => t.completed);
    if (completedTodos.length === 0) return;

    if (!window.confirm(`Delete ${completedTodos.length} completed task(s)?`)) {
      return;
    }

    try {
      await Promise.all(completedTodos.map((t) => todosAPI.deleteTodo(t.id)));
      toast.success('Completed tasks cleared');
      loadTodos();
    } catch (error) {
      toast.error('Failed to clear completed tasks');
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  const submitEdit = async () => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await todosAPI.renameTodo(editingId, editValue.trim());
      setEditingId(null);
      loadTodos();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const totalCount = todos.length;
  const pendingCount = todos.filter((t) => !t.completed).length;
  const doneCount = todos.filter((t) => t.completed).length;

  // Apply both the filter tab AND the search term together
  const visibleTodos = todos
    .filter((todo) => {
      if (filter === 'pending') return !todo.completed;
      if (filter === 'done') return todo.completed;
      return true;
    })
    .filter((todo) => todo.text.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <h2 className="text-2xl font-display font-extrabold text-neutral-900 dark:text-white mb-5">
        My To-Do List
      </h2>

      <form onSubmit={handleAddTodo} className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          className="flex items-center px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-sm font-semibold shadow-card transition-colors"
        >
          <Plus size={18} className="mr-1" />
          Add
        </button>
      </form>

      {/* Search box */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter tabs + clear completed */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          {['all', 'pending', 'done'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-colors ${
                filter === tab
                  ? 'bg-primary-700 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {doneCount > 0 && (
          <button
            onClick={handleClearCompleted}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            Clear completed
          </button>
        )}
      </div>

      {/* Todo list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : visibleTodos.length === 0 ? (
        <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
          {searchTerm
            ? 'No tasks match your search.'
            : filter === 'all'
            ? 'No tasks yet. Add one above to get started.'
            : `No ${filter} tasks.`}
        </p>
      ) : (
        <div className="space-y-2">
          {visibleTodos.map((todo) => (
            <div
              key={todo.id}
              className="group flex items-center bg-white dark:bg-surfaceMuted-dark border border-neutral-200 dark:border-neutral-800 rounded-2xl px-4 py-3 shadow-subtle hover:shadow-card hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200"
            >
              <button
                onClick={() => handleToggle(todo.id)}
                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mr-3 transition-colors ${
                  todo.completed
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-neutral-300 dark:border-neutral-600'
                }`}
              >
                {todo.completed && <Check size={14} className="text-white" />}
              </button>

              {editingId === todo.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitEdit();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={submitEdit}
                  className="flex-1 border border-primary-400 rounded-lg px-2 py-1 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              ) : (
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? 'line-through text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-900 dark:text-white'
                  }`}
                >
                  {todo.text}
                </span>
              )}

              <div className="flex items-center space-x-1 ml-2 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(todo)}
                  className="p-1 text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(todo.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary footer */}
      {!loading && todos.length > 0 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-400 font-mono">
          <span>
            Total: <strong className="text-neutral-900 dark:text-white">{totalCount}</strong>
          </span>
          <span>
            Pending: <strong className="text-neutral-900 dark:text-white">{pendingCount}</strong>
          </span>
          <span>
            Done: <strong className="text-neutral-900 dark:text-white">{doneCount}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default TodoList;