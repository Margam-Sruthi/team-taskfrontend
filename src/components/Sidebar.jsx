import Avatar from 'react-avatar';
import { Home, Layers, ClipboardList, Users, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/projects', label: 'Projects', icon: Layers },
  { path: '/tasks', label: 'Tasks', icon: ClipboardList },
  { path: '/team', label: 'Team', icon: Users },
];

function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-full bg-slate-950 text-slate-100 shadow-xl md:min-h-screen md:w-80">
      <div className="flex h-full flex-col justify-between p-6">
        <div>
          <div className="mb-8 rounded-[2rem] bg-indigo-600 px-5 py-6 shadow-[0_30px_60px_-30px_rgba(79,70,229,0.8)]">
            <h1 className="text-2xl font-semibold text-white">Team Task</h1>
            <p className="mt-2 text-sm text-indigo-100">Modern SaaS dashboard</p>
          </div>
          <div className="rounded-[2rem] bg-slate-900 p-5 shadow-sm border border-white/10">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name || 'User'} size="48" round={true} textSizeRatio={2.2} />
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
                <p className="mt-1 text-lg font-semibold text-white">{user?.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{role || user?.role}</p>
              </div>
            </div>
          </div>
          <nav className="mt-8 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-[1.75rem] px-4 py-3 text-sm font-semibold transition ${
                      isActive ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <button onClick={handleLogout} className="mt-8 flex items-center justify-center gap-2 rounded-[1.75rem] bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
