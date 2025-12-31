import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, List, Activity } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const isBatteriesList = location.pathname === '/' || location.pathname === '/batteries';
  const isMonitoring = location.pathname === '/monitoring';

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Sistema de Baterías</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard">
              <Button
                variant={isDashboard ? 'default' : 'outline'}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/">
              <Button
                variant={isBatteriesList ? 'default' : 'outline'}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Lista de Baterías
              </Button>
            </Link>
            <Link to="/monitoring">
              <Button
                variant={isMonitoring ? 'default' : 'outline'}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                Monitoreo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
