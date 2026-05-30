import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginApi, logoutApi, registerApi } from '../api/authApi';
import { logout, setCredentials, selectAuth } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);

  const login = async (credentials) => {
    const { data } = await loginApi(credentials);
    dispatch(setCredentials({ accessToken: data.accessToken, user: data.user }));
    toast.success('Welcome back!');
    navigate(data.user.role === 'admin' ? '/admin/subscriptions' : '/dashboard');
    return data;
  };

  const register = async (userData) => {
    await registerApi(userData);
    toast.success('Account created! Please login.');
    navigate('/login');
  };

  const signOut = async () => {
    try {
      await logoutApi();
    } catch {
      // proceed with local logout
    }
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return { ...auth, login, register, signOut };
};
