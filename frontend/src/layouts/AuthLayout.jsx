import { Outlet } from 'react-router-dom';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../hooks/useTheme';

const AuthLayout = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-90" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />

      <button
        onClick={toggleTheme}
        className="absolute right-4 top-4 z-10 rounded-xl bg-white/20 p-2 text-white backdrop-blur hover:bg-white/30"
      >
        {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center text-white">
            <h1 className="text-3xl font-bold tracking-tight">SubFlow</h1>
            <p className="mt-2 text-indigo-100">Subscription Management Dashboard</p>
          </div>
          <div className="glass-card p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
