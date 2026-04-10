import * as React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  public state: any = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: any): any {
    return { hasError: true, error };
  }

  public componentDidCatch(error: any, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if ((this as any).state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isPermissionError = false;

      try {
        const parsed = JSON.parse((this as any).state.error?.message || "{}");
        if (parsed.error?.toLowerCase().includes('permission-denied') || parsed.error?.toLowerCase().includes('insufficient permissions')) {
          errorMessage = "You don't have permission to access this resource. Please check your payment status.";
          isPermissionError = true;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 text-center border border-slate-100">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPermissionError ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              {isPermissionError ? 'Access Denied' : 'Something went wrong'}
            </h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              {errorMessage}
            </p>
            <Button 
              onClick={this.handleReset}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-12 font-bold flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Return to Home
            </Button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
