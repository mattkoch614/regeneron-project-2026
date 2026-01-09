import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import QualityDashboard from './components/QualityDashboard';
import StudyOverview from './components/StudyOverview';
import StudyDetail from './components/StudyDetail';

function Navigation() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/studies') {
      return location.pathname === '/studies' || location.pathname.startsWith('/studies/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Clinical Quality Dashboard
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                to="/studies"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/studies')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Study Overview
              </Link>
              <Link
                to="/quality-dashboard"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/quality-dashboard')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Quality Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<StudyOverview />} />
            <Route path="/studies" element={<StudyOverview />} />
            <Route path="/studies/:studyId" element={<StudyDetail />} />
            <Route path="/quality-dashboard" element={<QualityDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
