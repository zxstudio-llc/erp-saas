"use client"

import { useForm } from "@inertiajs/react"
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import tenant from "@/routes/tenant"
import { Hash, Mail, Briefcase, Building2, MapPin, FileText, Save, Loader2, Globe } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

export function CompanyForm({ tenantSlug, initialData }: { tenantSlug: string, initialData: any }) {
    const { data, setData, put, processing, errors } = useForm({
        ruc: initialData?.ruc ?? "",
        business_name: initialData?.business_name ?? "",
        trade_name: initialData?.trade_name ?? "",
        email: initialData?.email ?? "",
        address: initialData?.address ?? "",
        environment: initialData?.environment ?? "test",
        accounting_required: initialData?.accounting_required ?? false,
        special_taxpayer: initialData?.special_taxpayer ?? false,
    })

    const isReadOnly = initialData?.is_main;

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        
        put(tenant.companies.update({
            tenant: tenantSlug,
            company: initialData.id
        }).url, {
            preserveScroll: true,
            // 2. Implementar callbacks de Sonner
            onSuccess: () => {
                toast.success("Configuración actualizada", {
                    description: "Los datos de la empresa y el ambiente del SRI se han guardado.",
                })
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0] as string;
                toast.error("Error al actualizar", {
                    description: firstError || "No se pudieron guardar los cambios técnicos.",
                })
            }
        })
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <FieldSet>
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* RUC y Ambiente */}
                    <Field>
                        <FieldLabel className="flex items-center gap-2"><Hash className="w-4 h-4" /> RUC</FieldLabel>
                        <Input value={data.ruc} disabled={isReadOnly} className={isReadOnly ? "bg-muted opacity-80" : ""} />
                    </Field>

                    <Field>
                        <FieldLabel className="flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Ambiente SRI
                        </FieldLabel>
                        <Select
                            value={data.environment}
                            onValueChange={(v) => setData("environment", v)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${data.environment === 'prod' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        {data.environment === 'prod' ? 'Producción (SRI Real)' : 'Pruebas (Offline)'}
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="test">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                                        <span>Pruebas (Ambiente Offline)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="prod">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span>Producción (Emisión Real)</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.environment && <p className="text-xs text-destructive mt-1">{errors.environment}</p>}
                    </Field>

                    {/* Email y Razón Social */}
                    <Field className="md:col-span-1">
                        <FieldLabel className="flex items-center gap-2"><Mail className="w-4 h-4" /> Email Notificaciones</FieldLabel>
                        <Input value={data.email} onChange={(e) => setData("email", e.target.value)} />
                    </Field>

                    <Field className="md:col-span-1">
                        <FieldLabel className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> Razón Social</FieldLabel>
                        <Input value={data.business_name} disabled={isReadOnly} className={isReadOnly ? "bg-muted opacity-80" : ""} />
                    </Field>

                    <Field className="md:col-span-2">
                        <FieldLabel className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Nombre Comercial</FieldLabel>
                        <Input value={data.trade_name} onChange={(e) => setData("trade_name", e.target.value)} />
                    </Field>

                    <Field className="md:col-span-2">
                        <FieldLabel className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Dirección Matriz</FieldLabel>
                        <Input value={data.address} onChange={(e) => setData("address", e.target.value)} />
                    </Field>

                    {/* Toggles SRI */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${data.accounting_required ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-muted/20 border-transparent'}`}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold flex items-center gap-2">
                                    Obligado Contabilidad
                                </span>
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">Requerido según RUC</span>
                            </div>
                            <Switch 
                                checked={data.accounting_required} 
                                onCheckedChange={(v) => setData("accounting_required", v)}
                            />
                        </div>

                        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${data.special_taxpayer ? 'bg-primary/5 border-primary/30 shadow-sm' : 'bg-muted/20 border-transparent'}`}>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold">Contribuyente Especial</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-medium">Resolución del SRI</span>
                            </div>
                            <Switch 
                                checked={data.special_taxpayer} 
                                onCheckedChange={(v) => setData("special_taxpayer", v)}
                            />
                        </div>
                    </div>
                </FieldGroup>
            </FieldSet>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={processing} className="gap-2">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios Configuración
                </Button>
            </div>
        </form>
    )
}