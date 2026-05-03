import Avatar from 'react-avatar';
import { LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Topbar() {
  const { user, role, logout } = useAuth();

  return (
    <div className="mb-6 rounded-[2rem] bg-white px-6 py-5 shadow-lg shadow-slate-200/60">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Hello, {user?.name || 'Team Member'}</h1>
          <p className="mt-2 text-sm text-slate-500">Your workspace for projects, tasks, and team progress.</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
            <Search className="h-4 w-4" />
            Search
          </button>
          <div className="inline-flex items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-white shadow-sm">
            <Avatar name={user?.name || 'Team'} size="34" round={true} textSizeRatio={2.5} />
            <div className="text-left">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-slate-400">{role || user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Topbar;
