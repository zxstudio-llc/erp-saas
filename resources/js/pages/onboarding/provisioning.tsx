import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Database, 
  Layers, 
  Rocket, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import AuthTenantLayout from '@/layouts/auth-tenant-layout';

interface Props {
  tenant: string;
  email: string;
  tempPassword: string;
}

export default function Provisioning({ tenant, email, tempPassword }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getStatusDetails = () => {
    if (error) return { icon: <AlertCircle className="text-destructive" />, text: 'Hubo un problema' };
    if (progress < 30) return { icon: <Rocket className="animate-pulse text-blue-500" />, text: 'Iniciando configuración...' };
    if (progress < 60) return { icon: <Database className="animate-pulse text-indigo-500" />, text: 'Configurando base de datos...' };
    if (progress < 90) return { icon: <Layers className="animate-pulse text-violet-500" />, text: 'Preparando espacio de trabajo...' };
    if (progress < 100) return { icon: <Loader2 className="animate-spin text-primary" />, text: 'Finalizando detalles...' };
    return { icon: <CheckCircle2 className="text-green-500" />, text: '¡Todo listo! Ya puedes ingresar.' };
  };

  const { icon, text } = getStatusDetails();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    router.post(`/${tenant}/sign-in`, {
      email,
      password: tempPassword,
    }, {
      onSuccess: () => {
        router.visit(`/${tenant}/dashboard`);
      },
      onError: (errors: any) => {
        setError(errors?.email || 'Error al iniciar sesión');
        setLoading(false);
      },
    });
  };

  return (
    <AuthTenantLayout
      title="Onboarding"
      description="Configurando tu empresa"
    >
      <div className="flex items-center justify-center min-h-[60vh] ">
        <Empty className="border-none shadow-none">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="mb-4">
              {icon}
            </EmptyMedia>
            <EmptyTitle className="text-xl">
              {isReady ? '¡Cuenta lista!' : 'Estamos trabajando...'}
            </EmptyTitle>
            <EmptyDescription className="max-w-xs text-pretty mx-auto">
              Configurando el entorno para <strong>{tenant}</strong>. Por favor, espera unos segundos.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className="space-y-6">
          <div className="relative w-full pt-6">
              <div 
                className="absolute top-0 -mt-2 transition-all duration-100 ease-linear"
                style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
              >
                <span className="text-xs font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shadow-sm">
                  {Math.round(progress)}%
                </span>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-primary mx-auto" />
              </div>

              <Progress value={progress} className="h-2 transition-all" />
              
              <p className="text-sm font-medium text-muted-foreground mt-4 animate-pulse">
                {text}
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleLogin}
                disabled={!isReady || loading}
                size="lg"
                className="w-full transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accediendo...
                  </>
                ) : (
                  'Acceder a la app'
                )}
              </Button>
            </div>

            {error && (
              <div className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-md border border-destructive/20 animate-in zoom-in-95">
                {error}
              </div>
            )}
          </EmptyContent>
        </Empty>
      </div>
    </AuthTenantLayout>
  );
}