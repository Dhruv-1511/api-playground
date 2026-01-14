import { SignInForm } from '@/components/auth/SignInForm';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 dark" style={{ backgroundColor: '#16192b' }}>
      <SignInForm />
    </div>
  );
}
