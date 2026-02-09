import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthTenantLayout from '@/layouts/auth-tenant-layout';
import { Card, CardContent } from '@/components/ui/card';

interface Plan {
    id: number;
    name: string;
    price: number;
    billing_cycle: string;
}

export default function OnboardingRegister({ plan, plans = [] }: { plan?: Plan, plans: Plan[] }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        company_name: '',
        dni: '',
        slug: '',
        plan_id: plan?.id.toString() || '',
    });

    const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const slug = value.toLowerCase().trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        setData({ ...data, company_name: value, slug });
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/onboarding/signup');
    };

    return (
        <AuthTenantLayout title="Crea tu empresa" description="Completa los datos para configurar tu cuenta">
            <Head title="Registro de Empresa" />
            <Field className="overflow-hidden p-0 w-xl px-4">
                    <form onSubmit={submit} className="pt-6 md:pt-8">
                        <FieldGroup>
                            <div className="flex flex-col items-start gap-2 text-left">
                                <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
                                <p className="text-muted-foreground text-sm">
                                    Completa los datos a continuación para crear tu cuenta
                                </p>
                            </div>
                            <Field>
                                <FieldLabel>Plan</FieldLabel>
                                <Select value={data.plan_id} onValueChange={(v) => setData('plan_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name} - ${p.price}/{p.billing_cycle === 'monthly' ? 'mes' : 'año'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.plan_id} />
                            </Field>

                            <Field>
                                <Field className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel>Nombre</FieldLabel>
                                        <Input value={data.first_name} onChange={e => setData('first_name', e.target.value)} required />
                                        <InputError message={errors.first_name} />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Apellido</FieldLabel>
                                        <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)} required />
                                        <InputError message={errors.last_name} />
                                    </Field>
                                </Field>
                            </Field>
                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <Input type="email" value={data.email} placeholder="m@example.com" onChange={e => setData('email', e.target.value)} required />
                                <InputError message={errors.email} />
                                <FieldDescription className='text-wrap'>
                                    <span>Usaremos esta información para contactarte.</span>
                                    <span>No compartiremos tu correo electrónico con nadie más.</span>
                                </FieldDescription>
                            </Field>
                            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                Informacion de la empresa
                            </FieldSeparator>
                            <Field className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel>Nombre de la Empresa</FieldLabel>
                                    <Input value={data.company_name} onChange={handleCompanyNameChange} required />
                                    <InputError message={errors.company_name} />
                                </Field>
                                <Field>
                                    <FieldLabel>DNI / RUC</FieldLabel>
                                    <Input
                                        value={data.dni}
                                        onChange={e => setData('dni', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.dni} />
                                </Field>
                            </Field>
                            <Field>
                                <FieldLabel>URL de acceso</FieldLabel>
                                <div className="flex items-center gap-2 text-sm">
                                    <span>erpsaas.test/</span>
                                    <Input value={data.slug} readOnly className="bg-muted" />
                                </div>
                                <InputError message={errors.slug} />
                            </Field>
                            <Field>
                                <Button type="submit" disabled={processing} className="w-full">
                                    {processing && <Spinner />}
                                    Crear Empresa
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
            </Field>
        </AuthTenantLayout>
    );
}