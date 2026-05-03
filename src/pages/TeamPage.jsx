import { useEffect, useMemo, useState } from 'react';
import { Clock3, Users, Briefcase, CheckCircle2 } from 'lucide-react';
import { request } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

function TeamPage() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [assignMessage, setAssignMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [taskResponse, projectResponse] = await Promise.all([request('/tasks'), request('/projects')]);
      setTasks(Array.isArray(taskResponse) ? taskResponse : []);
      setProjects(Array.isArray(projectResponse) ? projectResponse : []);

      if (isAdmin) {
        const userResponse = await request('/users');
        setUsers(Array.isArray(userResponse) ? userResponse : []);
      } else {
        const memberMap = new Map();
        projectResponse.forEach((project) => {
          if (Array.isArray(project.members)) {
            project.members.forEach((member) => {
              memberMap.set(member._id, member);
            });
          }
        });
        if (user) {
          memberMap.set(user._id, { _id: user._id, name: user.name, email: user.email, role: user.role });
        }
        setUsers(Array.from(memberMap.values()));
      }
      setLoading(false);
    };
    loadData();
  }, [user]);

  const assignProject = async (event) => {
    event.preventDefault();
    setAssignMessage('');

    if (!selectedProject || !selectedMember) {
      setAssignMessage('Please select both a project and a member.');
      return;
    }

    try {
      const data = await request('/projects/assign', 'POST', {
        projectId: selectedProject,
        memberId: selectedMember,
      });
      if (data._id) {
        setAssignMessage('Member assigned to project successfully.');
        setSelectedProject('');
        setSelectedMember('');
        setProjects((current) => current.map((project) => (project._id === data._id ? data : project)));
      } else {
        setAssignMessage(data.message || 'Assignment failed.');
      }
    } catch (err) {
      setAssignMessage(err.message || 'Assignment failed.');
    }
  };

  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'done').length;
    const pendingTasks = tasks.filter((task) => task.status !== 'done').length;
    const overdueTasks = tasks.filter(
      (task) => new Date(task.deadline) < new Date() && task.status !== 'done'
    ).length;

    return { totalTasks, completedTasks, pendingTasks, overdueTasks };
  }, [tasks]);

  const memberStats = useMemo(() => {
    return users.map((member) => {
      const assigned = tasks.filter((task) => task.assignedTo?._id === member._id).length;
      const completed = tasks.filter((task) => task.assignedTo?._id === member._id && task.status === 'done').length;
      const overdue = tasks.filter(
        (task) => task.assignedTo?._id === member._id && new Date(task.deadline) < new Date() && task.status !== 'done'
      ).length;
      return {
        ...member,
        assigned,
        completed,
        overdue,
      };
    });
  }, [tasks, users]);

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-indigo-600">Team management</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Team performance</h2>
            <p className="mt-3 max-w-2xl text-slate-500">Review team roles, active projects, and task completion metrics in one dashboard.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Team members', value: users.length, icon: Users, color: 'bg-indigo-500' },
              { label: 'Projects', value: projects.length, icon: Briefcase, color: 'bg-slate-500' },
              { label: 'Tasks', value: metrics.totalTasks, icon: CheckCircle2, color: 'bg-emerald-500' },
              { label: 'Overdue', value: metrics.overdueTasks, icon: Clock3, color: 'bg-rose-500' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-[1.75rem] bg-slate-50 p-5 shadow-sm">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-sm uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-slate-900">Assign project member</h3>
            <p className="text-sm text-slate-500">Select a project and a team member to assign them.</p>
          </div>
          <form onSubmit={assignProject} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Project</span>
                <select
                  value={selectedProject}
                  onChange={(event) => setSelectedProject(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Member</span>
                <select
                  value={selectedMember}
                  onChange={(event) => setSelectedMember(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500"
                >
                  <option value="">Select a member</option>
                  {users
                    .filter((member) => member.role === 'member')
                    .map((member) => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                </select>
              </label>
            </div>
            {assignMessage && <p className="text-sm text-rose-600">{assignMessage}</p>}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Assign member
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Team members</h3>
              <p className="mt-1 text-sm text-slate-500">Current roles, task load, and completion status.</p>
            </div>
          </div>
          <div className="space-y-4">
            {memberStats.map((member) => (
              <div key={member._id} className="rounded-3xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                  <span className="inline-flex items-center rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                    {member.role}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{member.assigned}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Completed</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{member.completed}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overdue</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">{member.overdue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Role distribution</h3>
            <p className="mt-1 text-sm text-slate-500">Overview of team roles and responsibilities.</p>
          </div>
          <div className="space-y-4">
            {['admin', 'member'].map((roleKey) => {
              const roleCount = users.filter((member) => member.role === roleKey).length;
              const roleWidth = users.length ? Math.max(12, Math.min(100, Math.round((roleCount / users.length) * 100))) : 0;
              return (
                <div key={roleKey} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{roleKey}</span>
                    <span>{roleCount} member{roleCount === 1 ? '' : 's'}</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${roleWidth}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Active projects</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{projects.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Average completion</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">
                {metrics.totalTasks ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
