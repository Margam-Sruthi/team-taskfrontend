import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, ListChecks } from 'lucide-react';
import { request } from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  todo: 'bg-slate-100 text-slate-700',
  'in-progress': 'bg-indigo-100 text-indigo-700',
  done: 'bg-emerald-100 text-emerald-700',
};

function TasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadTasks = async () => {
    const data = await request('/tasks');
    setTasks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateTask = async (taskId, status) => {
    const data = await request(`/tasks/${taskId}`, 'PUT', { status });
    if (data._id) {
      setMessage('Status updated');
      loadTasks();
    } else {
      setMessage(data.message || 'Update failed');
    }
  };

  const deleteTask = async (taskId) => {
    const data = await request(`/tasks/${taskId}`, 'DELETE');
    if (data.message) {
      setMessage('Task deleted');
      loadTasks();
    }
  };

  const taskSummary = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === 'todo').length,
      inProgress: tasks.filter((task) => task.status === 'in-progress').length,
      done: tasks.filter((task) => task.status === 'done').length,
    };
  }, [tasks]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-slate-200/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">Tasks</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Progress at a glance</h2>
            <p className="mt-3 max-w-2xl text-slate-500">View your tasks, update progress, and keep the team moving.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total', value: taskSummary.total, icon: ListChecks },
              { label: 'In progress', value: taskSummary.inProgress, icon: ArrowUpRight },
              { label: 'Completed', value: taskSummary.done, icon: CheckCircle2 },
            ].map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.label} className="rounded-[1.75rem] bg-slate-50 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{group.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{group.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {message && <div className="rounded-3xl bg-slate-50 p-4 text-slate-700 shadow-sm">{message}</div>}
      <div className="space-y-5">
        {tasks.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-slate-600 shadow-lg shadow-slate-200/40">No tasks assigned yet.</div>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40 transition hover:-translate-y-0.5 hover:shadow-2xl">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{task.project?.name || 'Project task'}</p>
                  <h3 className="text-2xl font-semibold text-slate-900">{task.title}</h3>
                  <p className="text-slate-500">{task.description || 'No description provided.'}</p>
                </div>
                <div className="flex flex-col gap-4 sm:items-end">
                  <span className={`inline-flex rounded-full px-3 py-2 text-sm font-semibold ${statusStyles[task.status]}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                  <p className="text-sm text-slate-500">Due {new Date(task.deadline).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Assigned to</span>
                    <span>{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-indigo-600" style={{ width: task.status === 'done' ? '100%' : task.status === 'in-progress' ? '65%' : '25%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button onClick={() => deleteTask(task._id)} className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600">
                      Delete task
                    </button>
                  )}
                  <select value={task.status} onChange={(e) => updateTask(task._id, e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-100">
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TasksPage;
