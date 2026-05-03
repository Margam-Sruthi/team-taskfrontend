import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../services/api';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const { user, role, isAdmin } = useAuth();

  const visibleProjects = isAdmin
    ? projects
    : projects.filter((project) => project.members?.some((member) => member._id === user?._id));

  const loadProjects = async () => {
    const data = await request('/projects');
    const loadedProjects = Array.isArray(data) ? data : [];
    setProjects(loadedProjects);
    const visibleCount = isAdmin
      ? loadedProjects.length
      : loadedProjects.filter((project) => project.members?.some((member) => member._id === user?._id)).length;
    console.log('[ProjectsPage] role:', role, 'projects loaded:', loadedProjects.length, 'visibleProjects:', visibleCount);
    setLoading(false);
  };

  useEffect(() => {
    loadProjects();
  }, [role]);

  const createProject = async (event) => {
    event.preventDefault();
    const data = await request('/projects', 'POST', { name });
    if (data._id) {
      setName('');
      setMessage('Project created successfully');
      loadProjects();
    } else {
      setMessage(data.message || 'Could not create project');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-lg shadow-slate-200/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">Projects</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Your active projects</h2>
            <p className="mt-3 max-w-2xl text-slate-500">Organize work by project, add new initiatives, and keep the team aligned.</p>
          </div>
          {isAdmin && (
            <button onClick={() => document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' })} className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Add project
            </button>
          )}
        </div>
      </div>

      {message && <div className="rounded-3xl bg-slate-50 p-5 text-slate-700 shadow-sm">{message}</div>}

      {isAdmin && (
        <form id="project-form" className="rounded-[2rem] bg-white p-8 shadow-lg shadow-slate-200/40" onSubmit={createProject}>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="space-y-3">
              <span className="text-sm font-semibold text-slate-700">Project name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter project title" required className="w-full bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200" />
            </label>
            <button className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">Create project</button>
          </div>
        </form>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleProjects.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 text-slate-600 shadow-lg shadow-slate-200/40">
            {isAdmin ? 'No projects yet.' : 'No projects assigned to you.'}
          </div>
        ) : (
          visibleProjects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} className="group overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-slate-200/40 transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="h-40 bg-gradient-to-r from-indigo-600 via-slate-900 to-slate-700 px-6 py-5 text-white">
                <p className="text-xs uppercase tracking-[0.32em] text-indigo-200">Project</p>
                <h3 className="mt-3 text-2xl font-bold">{project.name}</h3>
              </div>
              <div className="space-y-4 p-6">
                <p className="text-sm text-slate-500">Created by {project.createdBy?.name || 'team'}</p>
                <div className="flex flex-wrap gap-2">
                  {project.members.map((member) => (
                    <span key={member._id} className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-600">{member.name}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{project.members.length} member{project.members.length === 1 ? '' : 's'}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">View details</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectsPage;
