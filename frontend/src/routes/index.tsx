import { createBrowserRouter } from 'react-router-dom';
import BatteriesListPage from '@/features/batteries/pages/BatteriesListPage';
import RegisterBatteryPage from '@/features/batteries/pages/RegisterBatteryPage';
import InstallBatteryPage from '@/features/batteries/pages/InstallBatteryPage';
import BatteryDetailPage from '@/features/batteries/pages/BatteryDetailPage';
import MaintenancePage from '@/features/batteries/pages/MaintenancePage';
import RemovalPage from '@/features/batteries/pages/RemovalPage';
import DisposalPage from '@/features/batteries/pages/DisposalPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BatteriesListPage />,
  },
  {
    path: '/batteries/register',
    element: <RegisterBatteryPage />,
  },
  {
    path: '/batteries/install',
    element: <InstallBatteryPage />,
  },
  {
    path: '/batteries/:id',
    element: <BatteryDetailPage />,
  },
  {
    path: '/batteries/:id/maintenance',
    element: <MaintenancePage />,
  },
  {
    path: '/batteries/:id/remove',
    element: <RemovalPage />,
  },
  {
    path: '/batteries/:id/dispose',
    element: <DisposalPage />,
  },
]);
