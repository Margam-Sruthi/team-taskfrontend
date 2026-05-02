import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-sky-100 px-4 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] bg-white p-12 shadow-2xl shadow-slate-200/40">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">404 error</p>
          <h2 className="mt-6 text-4xl font-semibold text-slate-900">Page not found</h2>
          <p className="mt-4 text-slate-600">The page you're looking for doesn't exist or may have been moved.</p>
          <Link className="mt-8 inline-flex rounded-3xl bg-indigo-600 px-6 py-4 text-sm font-semibold text-white transition hover:bg-indigo-700" to="/">
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
