import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { router } from './routes';
import { useBatteryWebSocket } from './hooks/useBatteryWebSocket';

function App() {
  // Conectar al WebSocket para recibir actualizaciones en tiempo real
  useBatteryWebSocket();

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
