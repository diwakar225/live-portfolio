import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from './StateViews';
import { Screen } from './Screen';

export interface AppErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onError?: (error: unknown, componentStack: string | null | undefined) => void;
}

interface AppErrorBoundaryState {
  readonly hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    this.props.onError?.(error, info.componentStack);
  }

  private readonly reset = (): void => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Screen edges={['top', 'left', 'right', 'bottom']}>
          <ErrorState
            message="The app hit an unexpected problem. You can try again."
            onRetry={this.reset}
          />
        </Screen>
      );
    }
    return this.props.children;
  }
}
