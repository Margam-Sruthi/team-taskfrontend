import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const data = await login(email, password);
    if (data.token) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 px-4 py-10">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl shadow-slate-950/30">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-gradient-to-br from-indigo-600 to-slate-950 px-10 py-12 text-white lg:px-14 lg:py-16">
            <div className="max-w-md">
              <p className="text-sm uppercase tracking-[0.32em] text-indigo-200">Team Task Manager</p>
              <h1 className="mt-6 text-4xl font-semibold">Welcome back</h1>
              <p className="mt-4 text-slate-200">Sign in to continue managing your projects, tasks, and team workflow from one modern dashboard.</p>
            </div>
          </div>
          <div className="bg-white px-10 py-12 lg:px-14 lg:py-16">
            <h2 className="text-3xl font-semibold text-slate-900">Sign in</h2>
            <p className="mt-3 text-sm text-slate-500">Enter your credentials to access the dashboard.</p>
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500" />
              </div>
              {error && <div className="rounded-3xl bg-rose-100 px-4 py-3 text-sm text-rose-700">{error}</div>}
              <button className="w-full rounded-3xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-indigo-700">Sign in</button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              Need an account?{' '}
              <Link className="font-semibold text-indigo-600 hover:text-indigo-700" to="/signup">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
