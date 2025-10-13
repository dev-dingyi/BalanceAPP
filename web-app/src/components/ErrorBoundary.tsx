import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    // Clear localStorage and reload
    if (window.confirm('Clear local storage and reload? Your Firebase data is safe.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#f5f5f5',
            p: 3,
          }}
        >
          <Paper sx={{ maxWidth: 600, p: 4 }}>
            <Typography variant="h4" gutterBottom color="error">
              Oops! Something went wrong
            </Typography>

            <Alert severity="error" sx={{ mb: 3 }}>
              The app encountered an error and couldn't recover.
            </Alert>

            <Typography variant="body1" paragraph>
              This might be due to:
            </Typography>
            <ul>
              <li>Incompatible browser storage data</li>
              <li>A recent update changing data structures</li>
              <li>Corrupted local cache</li>
            </ul>

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button variant="contained" onClick={this.handleReset} color="primary">
                Clear Storage & Reload
              </Button>
              <Button variant="outlined" onClick={this.handleReload}>
                Just Reload
              </Button>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Alternative: Open DevTools (F12) → Console → Run: <code>localStorage.clear(); location.reload();</code>
              </Typography>
            </Box>

            {import.meta.env.DEV && this.state.error && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#f5f5f5', overflow: 'auto' }}>
                  <Typography variant="caption" component="pre">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
