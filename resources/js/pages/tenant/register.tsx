import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function TenantRegister() {
    const { props } = usePage<{ email?: string }>();
    const emailFromQuery = props.email || '';

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Prellenar email readonly
    useEffect(() => {
        if (emailFromQuery) {
            form.setData('email', emailFromQuery);
        }
    }, [emailFromQuery]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(window.location.pathname, {
            preserveScroll: true,
            onSuccess: () => form.reset('password', 'password_confirmation'),
        });
    };

    return (
        <form onSubmit={submit}>
            <input
                type="text"
                name="name"
                value={form.data.name}
                onChange={(e) => form.setData('name', e.target.value)}
            />

            <input
                type="email"
                name="email"
                value={form.data.email}
                readOnly
            />

            <input
                type="password"
                name="password"
                value={form.data.password}
                onChange={(e) => form.setData('password', e.target.value)}
            />

            <input
                type="password"
                name="password_confirmation"
                value={form.data.password_confirmation}
                onChange={(e) =>
                    form.setData('password_confirmation', e.target.value)
                }
            />

            <button type="submit">Activar Cuenta</button>
        </form>
    );
}
