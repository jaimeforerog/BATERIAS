import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Ignorar errores de insertBefore que son conocidos en React 19
    if (error.message?.includes('insertBefore')) {
      console.warn('Error de React 19 ignorado:', error.message);
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    // Ignorar errores de insertBefore
    if (error.message?.includes('insertBefore')) {
      console.warn('Error de React 19 capturado e ignorado');
      // Resetear el error después de un momento
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 0);
      return;
    }
    console.error('Error capturado:', error);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-red-900 mb-4">
                Algo salió mal
              </h1>
              <p className="text-red-700 mb-4">
                {this.state.error.message}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
