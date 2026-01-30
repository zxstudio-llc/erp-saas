import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function TenantRegister({ tenant }: { tenant: string }) {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${tenant}/register`);
    };

    return (
        <AuthLayout
            title="Configura tu contraseña"
            description="Último paso para acceder a tu cuenta"
        >
            <Head title="Configurar Contraseña" />
            
            <form onSubmit={submit} className="space-y-6">
                <FieldGroup>
                    <Field>
                        <FieldLabel>Contraseña</FieldLabel>
                        <Input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            autoFocus
                            required
                        />
                        <InputError message={errors.password} />
                    </Field>

                    <Field>
                        <FieldLabel>Confirmar Contraseña</FieldLabel>
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