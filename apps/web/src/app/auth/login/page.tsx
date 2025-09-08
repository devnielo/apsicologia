import dynamic from 'next/dynamic';

// Import the login component dynamically to avoid SSR issues
const LoginPageClient = dynamic(() => import('./LoginPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    </div>
  ),
});

export default function LoginPage() {
  return <LoginPageClient />;
}
