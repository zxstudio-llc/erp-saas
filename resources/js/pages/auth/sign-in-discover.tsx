"use client";
import React, { useState } from "react";
import { Head, usePage, router } from '@inertiajs/react';
import { cn } from "@/lib/utils";
import { Spinner } from '@/components/ui/spinner';
import AuthTenantLayout from '@/layouts/auth-tenant-layout';
import InputError from '@/components/input-error';
import { Pages } from '@/types/pages';
import { Label } from "@/components/app/label";
import { Input } from "@/components/app/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
    const { tenant, errors } = usePage<Pages>().props;
    const [showPassword, setShowPassword] = useState(false);
    const [dni, setDni] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const titleText = tenant ? "¡Genial, te encontramos!" : "¡Hola! Busquemos tu empresa";
    const descriptionText = tenant
        ? `Todo listo para entrar a ${tenant.name || tenant.slug}. ¡Solo faltan tus datos!`
        : "Dinos el DNI o RUC de tu negocio para ubicarte en el mapa. ✨";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!tenant) {
            setLoading(true);
            router.post(`/sign-in/discover`, { dni }, {
                onFinish: () => setLoading(false),
            });
            return;
        }

        setLoading(true);
        router.post(`/${tenant.slug}/sign-in`, { email, password }, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <AuthTenantLayout title={titleText} description={descriptionText}>
            <Head title="Iniciar Sesión" />
            <div className="pt-8" />
            <Field className="shadow-input w-xl rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black border border-neutral-100 dark:border-white/[0.1]">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                    {titleText}
                </h2>
                <p className="mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-300">
                    {descriptionText}
                </p>

                <form className="my-8" onSubmit={handleSubmit}>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="dni">¿Cuál es tu DNI o RUC?</Label>
                        <Input
                            id="dni"
                            placeholder="Ej. 1712345678001"
                            type="text"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            disabled={!!tenant}
                            className={cn(!!tenant && "bg-neutral-100 dark:bg-zinc-800")}
                        />
                        <InputError message={errors.dni} />
                    </LabelInputContainer>

                    {tenant && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                            <LabelInputContainer className="mb-4">
                                <Label htmlFor="email">Tu correo electrónico</Label>
                                <Input
                                    id="email"
                                    placeholder="tu@correo.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <InputError message={errors.email} />
                            </LabelInputContainer>

                            <LabelInputContainer className="mb-8">
                                <Label htmlFor="password">Tu contraseña secreta</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        placeholder="••••••••"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant={'ghost'}
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                                <InputError message={errors.password} />
                            </LabelInputContainer>
                        </div>
                    )}

                    <Button
                        className="group/btn relative block w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-input dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Spinner className="h-4 w-4" />
                                <span>Un segundito...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span>{tenant ? '¡Listo, vamos adentro!' : 'Continuar'}</span>
                                <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                            </div>
                        )}
                        <BottomGradient />
                    </Button>

                    {tenant && !loading && (
                        <>
                            <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

                            <Button
                                type="button"
                                onClick={() => window.location.href = '/sign-in'}
                                className="group/btn relative flex h-10 w-full items-center justify-center space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:text-white"
                            >
                                <span className="text-xs text-neutral-700 dark:text-neutral-300">
                                    ¿Me equivoqué de número? Probar otro RUC
                                </span>
                                <BottomGradient />
                            </Button>
                        </>
                    )}
                </form>
            </Field>
        </AuthTenantLayout>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};