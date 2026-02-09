import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function TenantRegister({ email }: { email?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(window.location.pathname);
    };

    return (
        <AuthLayout title="Configura tu contraseña" description="Último paso">
            <Head title="Configurar Contraseña" />
            
            <form onSubmit={submit} className="space-y-6">
                <FieldGroup>
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input 
                            type="email" 
                            value={data.email} 
                            onChange={e => setData('email', e.target.value)} 
                            required 
                            readOnly={!!email}
                            className={email ? 'bg-muted' : ''}
                            autoFocus={!email}
                        />
                        <InputError message={errors.email} />
                    </Field>

                    <Field>
                        <FieldLabel>Contraseña</FieldLabel>
                        <Input 
                            type="password" 
                            value={data.password} 
                            onChange={e => setData('password', e.target.value)} 
                            required 
                            autoFocus={!!email}
                        />
                        <InputError message={errors.password} />
                    </Field>

                    <Field>
                        <FieldLabel>Confirmar</FieldLabel>
                        <Input 
                            type="password" 
                            value={data.password_confirmation} 
                            onChange={e => setData('password_confirmation', e.target.value)} 
                            required 
                        />
                    </Field>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing && <Spinner />}
                        Activar Cuenta
                    </Button>
                </FieldGroup>
            </form>
        </AuthLayout>
    );
}