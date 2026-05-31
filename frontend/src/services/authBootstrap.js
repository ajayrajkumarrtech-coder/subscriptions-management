import axios from 'axios';
import { store } from '../app/store';
import { setCredentials, logout } from '../features/auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const bootstrapAuth = async () => {
  const token = store.getState().auth.accessToken;
  if (!token) return;

  try {
    const { data } = await axios.post(
      `${API_URL}/auth/refresh-token`,
      {},
      { withCredentials: true }
    );
    store.dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
  } catch {
    store.dispatch(logout());
  }
};
