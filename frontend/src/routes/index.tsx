import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import MonitoringPage from '@/features/monitoring/pages/MonitoringPage';
import AuditReportPage from '@/features/audit/pages/AuditReportPage';
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
    element: <Layout><BatteriesListPage /></Layout>,
  },
  {
    path: '/dashboard',
    element: <Layout><DashboardPage /></Layout>,
  },
  {
    path: '/monitoring',
    element: <Layout><MonitoringPage /></Layout>,
  },
  {
    path: '/audit',
    element: <Layout><AuditReportPage /></Layout>,
  },
  {
    path: '/batteries/register',
    element: <Layout><RegisterBatteryPage /></Layout>,
  },
  {
    path: '/batteries/install',
    element: <Layout><InstallBatteryPage /></Layout>,
  },
  {
    path: '/batteries/:id',
    element: <Layout><BatteryDetailPage /></Layout>,
  },
  {
    path: '/batteries/:id/maintenance',
    element: <Layout><MaintenancePage /></Layout>,
  },
  {
    path: '/batteries/:id/remove',
    element: <Layout><RemovalPage /></Layout>,
  },
  {
    path: '/batteries/:id/dispose',
    element: <Layout><DisposalPage /></Layout>,
  },

]);
