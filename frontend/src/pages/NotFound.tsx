import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center text-center px-4">
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-gray-100 dark:border-slate-800 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl">
            <AlertTriangle className="text-red-500" size={40} />
          </div>
        </div>
        <h1 className="text-8xl font-black bg-gradient-to-br from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Home size={18} />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
