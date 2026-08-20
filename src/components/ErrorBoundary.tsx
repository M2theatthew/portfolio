import { Component, type ReactNode } from 'react';

// Without this, an uncaught error ANYWHERE in the tree (including inside a
// useEffect, e.g. a WebGL context failing to initialize) unmounts the
// entire React root — the site goes fully blank, all the way down to
// index.html's inline background color. Wrapping risky/optional pieces
// (the 3D globe, anything third-party) means a failure there just loses
// that piece instead of the whole page.
export default class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('[ErrorBoundary] caught:', error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
