import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Red de seguridad: un fallo al pintar cualquier componente dejaría la página
 * en blanco y sin pistas. Aquí al menos se ve qué pasó y la colección sigue
 * guardada en el navegador, así que recargar no pierde nada.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no controlado:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-bg-surface border border-border-base rounded-2xl p-6 shadow-2xl text-center">
          <h1 className="text-xl font-bold text-main mb-2">Algo se ha roto</h1>
          <p className="text-muted text-sm mb-4">
            Tu colección sigue guardada en este navegador. Recarga la página para volver a
            intentarlo.
          </p>
          <pre className="text-left text-[11px] text-sub bg-bg-panel rounded-lg p-3 mb-4 overflow-x-auto">
            {error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-black font-bold text-sm px-4 py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
