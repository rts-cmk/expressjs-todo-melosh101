import React, { useState, useEffect } from 'react';
import { getTodos, addTodo, updateTodo, deleteTodo, type Todo } from '../services/api';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const TodoPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated) {
      loadTodos();
    }
  }, [isLoading, isAuthenticated, navigate]);

  const loadTodos = async () => {
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 401) {
         // handled by useEffect
      } else {
         setError("Failed to load todos");
      }
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const todo = await addTodo(newTodo);
      setTodos([...todos, todo]);
      setNewTodo('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const updated = await updateTodo(id, { is_done: !completed });
      setTodos(todos.map(t => t.id === id ? updated : t));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="todo-container">
      <header>
        <h1>{user ? `${user.username}'s Todos` : 'My Todos'}</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleAddTodo} className="add-todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
        />
        <button type="submit">Add</button>
      </form>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.is_done ? 'completed' : ''}>
            <span onClick={() => handleToggle(todo.id, todo.is_done)}>
              {todo.title}
            </span>
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoPage;
