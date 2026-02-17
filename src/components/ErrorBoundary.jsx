"use client";

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-16 animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/8 border border-red-500/10
                          flex items-center justify-center">
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-300 text-sm font-semibold mb-1">Something went wrong</p>
          <p className="text-gray-600 text-xs mb-5">An unexpected error occurred</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xs px-5 py-2 rounded-lg font-semibold bg-violet-500/12 text-violet-400
                       hover:bg-violet-500/20 border border-violet-500/15 active:scale-[0.97]
                       transition-all cursor-pointer"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
