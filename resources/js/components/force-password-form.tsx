import { useState, useMemo } from 'react';
import useTenant from '@/hooks/use-tenant';
import { update } from '@/routes/tenant/password/force';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Check, X, RefreshCw } from 'lucide-react';

import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ForcePasswordForm() {
    const tenant = useTenant.required();
    
    // Estados independientes para mostrar/ocultar cada campo
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const generateSecurePassword = () => {
        const length = 12;
        const charset = {
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lower: "abcdefghijklmnopqrstuvwxyz",
            number: "0123456789",
            symbol: "!@#$%^&*"
        };
        
        let password = "";
        password += charset.upper[Math.floor(Math.random() * charset.upper.length)];
        password += charset.number[Math.floor(Math.random() * charset.number.length)];
        password += charset.symbol[Math.floor(Math.random() * charset.symbol.length)];
        
        const allChars = Object.values(charset).join("");
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        const shuffled = password.split('').sort(() => 0.5 - Math.random()).join('');
        
        setData((prev) => ({
            ...prev,
            password: shuffled,
            password_confirmation: shuffled
        }));
        
        // Al generar, mostramos temporalmente para que el usuario vea qué se generó
        setShowPassword(true);
        setShowConfirm(true);
        toast.info("Contraseña segura generada");
    };

    const validations = useMemo(() => [
        { label: 'Entre 8 y 12 caracteres', test: data.password.length >= 8 && data.password.length <= 12 },
        { label: 'Usa mayúsculas (A-Z)', test: /[A-Z]/.test(data.password) },
        { label: 'Usa números (0-9)', test: /[0-9]/.test(data.password) },
        { label: 'Usa símbolos (!@#$)', test: /[^A-Za-z0-9]/.test(data.password) },
    ], [data.password]);

    const strength = useMemo(() => validations.filter(v => v.test).length, [validations]);

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-muted';
        if (strength <= 2) return 'bg-red-500';
        if (strength === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(update(tenant.slug).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Contraseña actualizada correctamente');
                reset();
            },
            onError: () => toast.error('Revisa los requisitos de seguridad'),
        });
    };

    return (
        <FieldSet className="w-full max-w-xl mx-auto">
            <form onSubmit={submit} className="space-y-6 text-left">
                <FieldGroup className="space-y-5">
                    {/* Campo: Nueva Contraseña */}
                    <Field>
                        <div className="flex justify-between items-end mb-1.5">
                            <FieldLabel htmlFor="password">Nueva Contraseña</FieldLabel>
                            <button 
                                type="button" 
                                onClick={generateSecurePassword}
                                className="text-[11px] flex items-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-800 uppercase tracking-tight transition-colors"
                            >
                                <RefreshCw size={12} className={processing ? 'animate-spin' : ''} /> 
                                Generar segura
                            </button>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Ingresa tu contraseña"
                                className="pr-12 h-11"
                                value={data.password}
                                maxLength={12}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <Button
                                type="button"
                                variant='ghost'
                                size="icon"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </Button>
                        </div>

                        {/* Barra de fortaleza */}
                        <div className="flex gap-1.5 h-1.5 mt-3">
                            {[1, 2, 3, 4].map((step) => (
                                <div
                                    key={step}
                                    className={`h-full w-full rounded-full transition-all duration-300 ${
                                        step <= strength ? getStrengthColor() : 'bg-muted'
                                    }`}
                                />
                            ))}
                        </div>

                        {/* Requisitos */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                            {validations.map((v, i) => (
                                <div key={i} className="flex items-center gap-2 text-[13px]">
                                    <div className={`flex items-center justify-center h-4 w-4 rounded-full border transition-all ${
                                        v.test ? 'bg-green-500 border-green-500' : 'border-muted-foreground/40'
                                    }`}>
                                        {v.test ? (
                                            <Check className="h-2.5 w-2.5 text-white" />
                                        ) : (
                                            <X className="h-2.5 w-2.5 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <span className={v.test ? "text-foreground font-medium" : "text-muted-foreground"}>
                                        {v.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Field>

                    {/* Campo: Confirmar Contraseña */}
                    <Field>
                        <FieldLabel htmlFor="password_confirmation">Confirmar nueva contraseña</FieldLabel>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                type={showConfirm ? "text" : "password"}
                                placeholder="Repite tu contraseña"
                                className="pr-12 h-11"
                                maxLength={12}
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                            <Button
                                type="button"
                                variant='ghost'
                                size="icon"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-transparent"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </Button>
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-xs text-destructive mt-1.5 font-medium">{errors.password_confirmation}</p>
                        )}
                        {data.password_confirmation && data.password !== data.password_confirmation && (
                            <p className="text-xs text-orange-600 mt-1.5 font-medium bg-orange-50 p-1 px-2 rounded border border-orange-100 inline-block">
                                Las contraseñas no coinciden aún
                            </p>
                        )}
                    </Field>
                </FieldGroup>

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all active:scale-[0.98]"
                        disabled={processing || !validations.every(v => v.test) || data.password !== data.password_confirmation}
                    >
                        {processing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Actualizar Contraseña'
                        )}
                    </Button>
                </div>
            </form>
        </FieldSet>
    );
}