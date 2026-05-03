import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { request } from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user, role, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const visibleProjects = isAdmin
    ? projects
    : projects.filter((project) => project.members?.some((member) => member._id === user?._id));

  useEffect(() => {
    const loadData = async () => {
      const [taskResponse, projectResponse] = await Promise.all([request('/tasks'), request('/projects')]);
      setTasks(Array.isArray(taskResponse) ? taskResponse : []);
      setProjects(Array.isArray(projectResponse) ? projectResponse : []);
      console.log('[Dashboard] role:', role, 'loaded projects:', projectResponse?.length, 'visibleProjects:', visibleProjects.length);
      setLoading(false);
    };
    loadData();
  }, [role, isAdmin, user?._id]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 'done').length;
    const pending = tasks.filter((task) => task.status !== 'done').length;
    const overdue = tasks.filter((task) => new Date(task.deadline) < new Date() && task.status !== 'done').length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, completionRate };
  }, [tasks]);

  const chartData = useMemo(
    () => [
      { label: 'Todo', value: tasks.filter((task) => task.status === 'todo').length },
      { label: 'In Progress', value: tasks.filter((task) => task.status === 'in-progress').length },
      { label: 'Done', value: stats.completed },
    ],
    [tasks, stats.completed]
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">Overview</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Team Performance</h2>
            <p className="mt-2 text-slate-500">A clear view of your project workload and task completion progress.</p>
          </div>
          <div className="rounded-3xl bg-slate-50 px-5 py-4 text-center shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Completion</p>
            <p className="mt-2 text-4xl font-bold text-indigo-600">{stats.completionRate}%</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${stats.completionRate}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {[
          { label: 'Total tasks', value: stats.total, color: 'bg-indigo-500' },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-500' },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-500' },
          { label: 'Overdue', value: stats.overdue, color: 'bg-rose-500' },
          { label: isAdmin ? 'All projects' : 'Assigned projects', value: visibleProjects.length, color: 'bg-slate-500' },
        ].map((card) => (
          <div key={card.label} className="rounded-[1.75rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white ${card.color}`}>
              {card.label[0]}
            </div>
            <p className="mt-6 text-sm uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Task status trend</h3>
              <p className="mt-1 text-sm text-slate-500">Track tasks across progress stages.</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)' }} />
                <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#colorStatus)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900">Progress summary</h3>
          <div className="mt-6 space-y-5">
            {[
              { label: 'Done', value: stats.completed, max: stats.total, color: 'bg-emerald-500' },
              { label: 'In progress', value: tasks.filter((task) => task.status === 'in-progress').length, max: stats.total, color: 'bg-indigo-500' },
              { label: 'Todo', value: tasks.filter((task) => task.status === 'todo').length, max: stats.total, color: 'bg-slate-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}/{item.max}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.max ? Math.round((item.value / item.max) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
