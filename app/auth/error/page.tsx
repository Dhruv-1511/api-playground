'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle, Zap } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification link has expired or has already been used.',
    Default: 'An error occurred during authentication.',
  };

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 mb-4 shadow-lg shadow-red-500/25">
          <AlertCircle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>

      {/* Card Container */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-xl shadow-black/5 space-y-3">
        <a
          href="/auth/signin"
          className="flex w-full items-center justify-center rounded-md bg-blue-500 hover:bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors shadow-lg shadow-blue-500/25"
        >
          Try again
        </a>
        <a
          href="/"
          className="flex w-full items-center justify-center rounded-md border border-border bg-background hover:bg-accent px-4 py-2.5 text-sm font-medium text-foreground transition-colors"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-blue-500/20"></div>
        <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
      </div>
      <div className="text-gray-400 text-sm font-medium">Loading...</div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 dark" style={{ backgroundColor: '#16192b' }}>
      <Suspense fallback={<LoadingFallback />}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
