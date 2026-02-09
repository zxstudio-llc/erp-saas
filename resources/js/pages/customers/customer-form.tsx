"use client"

import React from "react"
import { useForm } from "@inertiajs/react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
    Save, Loader2, User, Mail, Phone, MapPin, 
    Fingerprint, CreditCard, Globe, Building 
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import customers from "@/routes/tenant/customers" // Importamos el objeto Wayfinder que pasaste

export function CustomerForm({ tenantSlug, initialData, onSuccess }: any) {
    const isEdit = !!initialData

    const { data, setData, post, put, processing, errors } = useForm({
        identification_type: initialData?.identification_type ?? "RUC",
        identification: initialData?.identification ?? "",
        business_name: initialData?.business_name ?? "",
        email: initialData?.email ?? "",
        phone: initialData?.phone ?? "",
        address: initialData?.address ?? "",
        active: initialData?.active ?? true,
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()

        const customerId = initialData?.id;
        const url = isEdit && customerId
        ? customers.update({ tenant: tenantSlug, customer: customerId }).url
        : customers.store({ tenant: tenantSlug }).url

    if (isEdit) {
        put(url, { onSuccess: () => onSuccess?.() })
    } else {
        post(url, { onSuccess: () => onSuccess?.() })
    }
    }

    return (
        <form onSubmit={submit} className="space-y-6 animate-in fade-in duration-500">
            <FieldGroup className="space-y-4">
                {/* Identificación */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field className="col-span-1">
                        <FieldLabel className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> Tipo ID
                        </FieldLabel>
                        <Select 
                            value={data.identification_type} 
                            onValueChange={(val) => setData("identification_type", val)}
                        >
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RUC">RUC</SelectItem>
                                <SelectItem value="CI">Cédula</SelectItem>
                                <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field className="col-span-2">
                        <FieldLabel className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <Fingerprint className="w-3 h-3" /> Número de Identificación
                        </FieldLabel>
                        <Input 
                            value={data.identification} 
                            onChange={(e) => setData("identification", e.target.value)} 
                            placeholder="0999999999001" 
                            className="h-9 font-mono"
                        />
                        {errors.identification && <span className="text-[10px] text-destructive mt-1 font-medium">{errors.identification}</span>}
                    </Field>
                </div>

                {/* Nombre / Razón Social */}
                <Field>
                    <FieldLabel className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <Building className="w-3 h-3" /> Nombre o Razón Social
                    </FieldLabel>
                    <Input 
                        value={data.business_name} 
                        onChange={(e) => setData("business_name", e.target.value)} 
                        placeholder="Ej. Juan Pérez o Empresa S.A." 
                        className="h-9"
                    />
                    {errors.business_name && <span className="text-[10px] text-destructive mt-1 font-medium">{errors.business_name}</span>}
                </Field>

                {/* Email y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                        <FieldLabel className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Correo Electrónico
                        </FieldLabel>
                        <Input 
                            type="email"
                            value={data.email} 
                            onChange={(e) => setData("email", e.target.value)} 
                            placeholder="cliente@ejemplo.com" 
                            className="h-9 text-xs"
                        />
                        {errors.email && <span className="text-[10px] text-destructive mt-1 font-medium">{errors.email}</span>}
                    </Field>

                    <Field>
                        <FieldLabel className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Teléfono
                        </FieldLabel>
                        <Input 
                            value={data.phone} 
                            onChange={(e) => setData("phone", e.target.value)} 
                            placeholder="0987654321" 
                            className="h-9 text-xs"
                        />
                    </Field>
                </div>

                {/* Dirección */}
                <Field>
                    <FieldLabel className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Dirección Completa
                    </FieldLabel>
                    <Input 
                        value={data.address} 
                        onChange={(e) => setData("address", e.target.value)} 
                        placeholder="Calle, ciudad, sector..." 
                        className="h-9 text-xs"
                    />
                </Field>

                {/* Estado Activo */}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                    <div className="space-y-0.5">
                        <span className="text-xs font-bold uppercase tracking-tight">Estado del Cliente</span>
                        <p className="text-[10px] text-muted-foreground">Define si el cliente puede recibir facturas.</p>
                    </div>
                    <Switch 
                        checked={data.active} 
                        onCheckedChange={(val) => setData("active", val)} 
                    />
                </div>
            </FieldGroup>

            {/* Acciones */}
            <div className="pt-4 space-y-3">
                <Button 
                    type="submit" 
                    disabled={processing} 
                    className="w-full font-bold shadow-md hover:shadow-primary/20 transition-all"
                >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isEdit ? "Guardar Cambios" : "Crear Cliente"}
                </Button>
            </div>
        </form>
    )
}