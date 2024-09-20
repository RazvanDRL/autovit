'use client';

import React, { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.sendErrorToApi(error, errorInfo);
    }

    sendErrorToApi(error: Error, errorInfo: ErrorInfo) {
        fetch('/api/report-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                url: window.location.href,
            }),
        }).catch(console.error); // Log any errors in sending the report
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong. We're looking into it.</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;