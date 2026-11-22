"use client";

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = { fallback: ReactNode; children: ReactNode; label?: string };
type State = { failed: boolean };

/**
 * Keeps a failure in an optional, decorative part of the page (WebGL, a remote asset)
 * from taking the whole page down. Renders `fallback` instead and logs a warning.
 * Works both in the DOM tree and inside a React Three Fiber <Canvas>.
 */
export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.warn(`[${this.props.label ?? "scene"}] failed, showing fallback.`, error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
