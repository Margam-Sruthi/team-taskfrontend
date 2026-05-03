import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from 'react-avatar';
import { request } from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

function ProjectPage() {
  const { id } = useParams();
  const { user, role, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [taskData, setTaskData] = useState({ title: '', description: '', assignedTo: '', deadline: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProject = async () => {
    try {
      const data = await request(`/projects/${id}`);
      setProject(data._id ? data : null);
      setError('');
    } catch (err) {
      setProject(null);
      setError(err.message || 'Unable to load project');
    }
  };

  const loadTasks = async () => {
    const data = await request('/tasks');
    setTasks(Array.isArray(data) ? data.filter((t) => t.project?._id === id) : []);
  };

  const loadUsers = async () => {
    if (!isAdmin) return;
    const data = await request('/users');
    setUsers(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadProject();
      await loadTasks();
      await loadUsers();
      setLoading(false);
    };
    fetchData();
  }, [id, isAdmin]);

  const addMember = async (event) => {
    event.preventDefault();
    const data = await request('/projects/assign', 'POST', { projectId: id, memberId });
    if (data._id) {
      setProject(data);
      setMemberId('');
      setMessage('Member added successfully');
    } else {
      setMessage(data.message || 'Could not add member');
    }
  };

  const addTask = async (event) => {
    event.preventDefault();
    const payload = { ...taskData, projectId: id };
    const data = await request('/tasks', 'POST', payload);
    if (data._id) {
      setTaskData({ title: '', description: '', assignedTo: '', deadline: '' });
      loadTasks();
      setMessage('Task added successfully');
    } else {
      setMessage(data.message || 'Could not create task');
    }
  };

  const updateStatus = async (taskId, status) => {
    await request(`/tasks/${taskId}`, 'PUT', { status });
    loadTasks();
  };

  if (loading) return <Loader />;
  if (!project) return <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-slate-200/40">{error || 'Project not found.'}</div>;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-slate-200/40">
        <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-indigo-600">Project details</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{project.name}</h2>
            <p className="mt-3 text-slate-500">A centralized view of project progress, assigned members, and delivery milestones.</p>
          </div>
          <div className="rounded-[1.75rem] bg-slate-50 p-5 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Team members</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {project.members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-sm">
                  <Avatar name={member.name} size="36" round />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {message && <div className="rounded-3xl bg-slate-50 p-5 text-slate-700 shadow-sm">{message}</div>}

      {isAdmin && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form className="rounded-[2rem] bg-white p-8 shadow-lg shadow-slate-200/40" onSubmit={addMember}>
            <h3 className="mb-4 text-xl font-semibold text-slate-900">Add a team member</h3>
            <label className="mb-4 block text-sm font-semibold text-slate-700">Select member</label>
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
              <option value="">Select a user</option>
              {users.map((userOption) => (
                <option key={userOption._id} value={userOption._id}>
                  {userOption.name} ({userOption.email})
                </option>
              ))}
            </select>
            <button className="mt-6 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">Add member</button>
          </form>
          <form className="rounded-[2rem] bg-white p-8 shadow-lg shadow-slate-200/40" onSubmit={addTask}>
            <h3 className="mb-4 text-xl font-semibold text-slate-900">Create a task</h3>
            <label className="mb-4 block text-sm font-semibold text-slate-700">Task title</label>
            <input value={taskData.title} onChange={(e) => setTaskData({ ...taskData, title: e.target.value })} placeholder="Task title" required className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200" />
            <label className="mt-4 mb-4 block text-sm font-semibold text-slate-700">Description</label>
            <textarea value={taskData.description} onChange={(e) => setTaskData({ ...taskData, description: e.target.value })} placeholder="Task details" className="w-full min-h-[120px] bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200" />
            <label className="mt-4 mb-4 block text-sm font-semibold text-slate-700">Assign to</label>
            <select value={taskData.assignedTo} onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })} required className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
              <option value="">Select assignee</option>
              {users.map((userOption) => (
                <option key={userOption._id} value={userOption._id}>
                  {userOption.name} ({userOption.email})
                </option>
              ))}
            </select>
            <label className="mt-4 mb-4 block text-sm font-semibold text-slate-700">Deadline</label>
            <input value={taskData.deadline} onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })} type="date" required className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200" />
            <button className="mt-6 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">Create task</button>
          </form>
        </div>
      )}

      <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-slate-200/40">
        <h3 className="mb-6 text-xl font-semibold text-slate-900">Project tasks</h3>
        <div className="grid gap-5">
          {tasks.length === 0 ? (
            <div className="rounded-[1.75rem] bg-slate-50 p-6 text-slate-600">No tasks in this project yet.</div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="rounded-[1.75rem] bg-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h4 className="text-xl font-semibold text-slate-900">{task.title}</h4>
                    <p className="mt-2 text-slate-500">Assigned to {task.assignedTo?.name || 'unknown'}</p>
                    <p className="mt-2 text-sm text-slate-500">{task.description || 'No description available.'}</p>
                  </div>
                  <div className="space-y-3 text-right">
                    <span className={`inline-flex rounded-full px-3 py-2 text-sm font-semibold ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700' : task.status === 'in-progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <p className="text-sm text-slate-500">Due {new Date(task.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white shadow-sm">
                    <div className={`h-full rounded-full ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-indigo-500' : 'bg-slate-400'}`} style={{ width: task.status === 'done' ? '100%' : task.status === 'in-progress' ? '65%' : '20%' }} />
                  </div>
                  <select value={task.status} onChange={(e) => updateStatus(task._id, e.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-100">
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectPage;
