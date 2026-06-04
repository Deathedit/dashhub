import { Component, type ErrorInfo, type ReactNode } from 'react';
import { text } from '@/constants/text';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className='flex min-h-[50vh] items-center justify-center px-4'>
          <div className='mx-auto max-w-md text-center'>
            <p className='mb-2 text-lg font-bold text-destructive'>{text.errors.unexpectedError}</p>
            <p className='mb-6 text-sm text-muted-foreground'>{this.state.error.message}</p>
            <Button onClick={this.handleRetry}>{text.errors.retry}</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
