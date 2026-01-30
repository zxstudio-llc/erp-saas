import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        slug: '',
        plan_id: plan?.id.toString() || '',
        organization_size: '',
        phone: '',
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
        post('/onboarding/provision');
    };

    return (
        <AuthLayout
            title="Crea tu empresa"
            description="Completa los datos para configurar tu cuenta"
        >
            <Head title="Registro de Empresa" />
            
            <form onSubmit={submit} className="space-y-6">
                <FieldGroup>
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

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                        <InputError message={errors.email} />
                    </Field>

                    <Field>
                        <FieldLabel>Nombre de la Empresa</FieldLabel>
                        <Input value={data.company_name} onChange={handleCompanyNameChange} required />
                        <InputError message={errors.company_name} />
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
                        <FieldLabel>Tamaño de la organización</FieldLabel>
                        <Input value={data.organization_size} onChange={e => setData('organization_size', e.target.value)} />
                    </Field>

                    <Field>
                        <FieldLabel>Teléfono</FieldLabel>
                        <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                    </Field>

                    <Button type="submit" disabled={processing} className="w-full">
                        {processing && <Spinner />}
                        Crear Empresa
                    </Button>
                </FieldGroup>
            </form>
        </AuthLayout>
    );
}