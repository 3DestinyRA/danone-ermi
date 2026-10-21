import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Viewer crash:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-white p-8 text-center">
          <h2 className="text-lg font-semibold mb-2 text-[color:var(--color-brand-dark)]">
            No se pudo cargar el visor 3D
          </h2>
          <p className="text-sm text-[color:var(--color-text-dim)] mb-4 max-w-md">
            {String(this.state.error.message ?? this.state.error)}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-dark)] px-5 py-2.5 text-white text-sm font-semibold transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
