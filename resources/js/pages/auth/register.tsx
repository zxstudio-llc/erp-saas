import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Rocket, Server, ShieldCheck } from "lucide-react";

interface Plan {
    id: number;
    name: string;
}

export default function Register({ plan_id, plans = [] }: { plan_id?: string, plans: Plan[] }) {
    // Estado para mensajes de carga dinámicos
    const [loadingStep, setLoadingStep] = useState(0);
    
    const messages = [
        "Iniciando creación de cuenta...",
        "Configurando tu base de datos privada...",
        "Provisionando servidores en la nube...",
        "Instalando módulos del ERP...",
        "Casi listo, preparando tu acceso..."
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        slug: '',
        plan_id: plan_id ? plan_id.toString() : '', 
    });

    // Cambiar mensajes mientras carga
    useEffect(() => {
        if (processing) {
            const interval = setInterval(() => {
                setLoadingStep((prev) => (prev < messages.length - 1 ? prev + 1 : prev));
            }, 8000); // Cambia cada 8 segundos
            return () => clearInterval(interval);
        }
    }, [processing]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(store().url);
    };

    const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const generatedSlug = value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        setData((prev) => ({
            ...prev,
            company_name: value,
            slug: generatedSlug
        }));
    };

    return (
        <AuthLayout
            title={processing ? "Configurando tu entorno" : "Crea tu cuenta"}
            description={processing ? "Por favor no cierres esta ventana" : "Ingresa los datos de tu empresa para comenzar"}
        >
            <Head title="Registro" />
            
            {processing ? (
                /* VISTA DE CARGA PERSUASIVA */
                <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in duration-500">
                    <div className="relative mb-8">
                        <Spinner className="w-16 h-16 text-primary" />
                        <Rocket className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-bounce" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                        {messages[loadingStep]}
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[280px]">
                        Estamos preparando una instancia segura y dedicada para <strong>{data.company_name}</strong>.
                    </p>
                    
                    <div className="mt-8 grid grid-cols-1 gap-4 w-full max-w-xs text-left">
                        <div className={`flex items-center gap-3 text-sm ${loadingStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                            <Server className="w-4 h-4" />
                            <span>Aislamiento de base de datos</span>
                        </div>
                        <div className={`flex items-center gap-3 text-sm ${loadingStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Configuración de seguridad SSL</span>
                        </div>
                    </div>
                </div>
            ) : (
                /* FORMULARIO ORIGINAL */
                <form onSubmit={submit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="plan_id">Plan de suscripción</FieldLabel>
                            <Select 
                                value={data.plan_id} 
                                onValueChange={(value) => setData('plan_id', value)}
                            >
                                <SelectTrigger id="plan_id">
                                    <SelectValue placeholder="Selecciona un plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {plans.map((plan) => (
                                            <SelectItem key={plan.id} value={plan.id.toString()}>
                                                {plan.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.plan_id} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="company_name">Nombre de la Empresa</FieldLabel>
                            <Input
                                id="company_name"
                                value={data.company_name}
                                onChange={handleCompanyNameChange}
                                placeholder="Ej: Mi Empresa S.A."
                                required
                            />
                            <InputError message={errors.company_name} />
                        </Field>
                        
                        <Field>
                            <FieldLabel>URL de tu Dashboard</FieldLabel>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span>saas.com/</span>
                                <Input 
                                id="slug" 
                                value={data.slug || 'tu-empresa'}
                                readOnly 
                                className="bg-muted h-8" 
                            />
                            </div>
                            <InputError message={errors.slug} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="name">Nombre del administrador</FieldLabel>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password_confirmation">Confirmar</FieldLabel>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={e => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </Field>
                        </div>

                        <Button type="submit" disabled={processing} className="w-full mt-4">
                            {processing && <Spinner className="mr-2" />}
                            Crear cuenta y empresa
                        </Button>
                    </FieldGroup>
                </form>
            )}

            {!processing && (
                <div className="text-center text-sm text-muted-foreground mt-6">
                    ¿Ya tienes cuenta?{' '}
                    <TextLink href={login()}>Inicia sesión</TextLink>
                </div>
            )}
        </AuthLayout>
    );
}