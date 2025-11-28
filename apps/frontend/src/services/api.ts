import axios from "axios";
import type { User } from "../context/AuthContext";


export const login = async (username: string, password: string): Promise<User | undefined> => {
    const response = await axios.post(`/api/auth/login`, { username, password }, {
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true
    });
    
    if (response.status === 200 && response.data.user) {
      return response.data.user;
    }
    
    // Fallback or if user data not in login response
    const userData = await axios.get<User>(`/api/auth/me`);
    return userData.data;
};

export const register = async (username: string, email: string, password: string): Promise<User | undefined> => {
    const response = await axios.post(`/api/auth/register`, { username, email, password }, {
      headers: {
        "Content-Type": "application/json"
      },
      withCredentials: true
    });
    
    if (response.status === 201 && response.data.user) {
      return response.data.user;
    }
    return undefined;
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get<User>(`/api/auth/me`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export interface Todo {
  id: string;
  title: string;
  is_done: boolean;
}

type apiSuccessReponse<T> = {
  status: number;
  results: T;
};

export const getTodos = async (): Promise<Todo[]> => {
  const response = await axios.get<apiSuccessReponse<Todo[]>>(`/api/todo`);
  return response.data.results;
};

export const addTodo = async (title: string): Promise<Todo> => {
  const response = await axios.post<apiSuccessReponse<Todo>>(`/api/todo`, { title });
  return response.data.results;
};

export const updateTodo = async (id: string, updates: Partial<Todo>): Promise<Todo> => {
  const response = await axios.put<apiSuccessReponse<Todo>>(`/api/todo/${id}`, updates); 
  return response.data.results;
};

export const deleteTodo = async (id: string): Promise<void> => {
  await axios.delete(`/api/todo/${id}`);
};
