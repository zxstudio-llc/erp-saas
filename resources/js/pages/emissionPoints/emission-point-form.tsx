"use client"

import React, { useEffect } from "react"
import { useForm, usePage } from "@inertiajs/react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Save, Loader2, Info, Hash, Store, Monitor } from "lucide-react"
import tenantRoutes from "@/routes/tenant"
import { toast } from "sonner"

export function EmissionPointForm({ tenantSlug, initialData, onSuccess }: any) {
    const { establishments, next_code }: any = usePage().props;
    const isEdit = !!initialData

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        establishment_id: initialData?.establishment_id?.toString() ?? (establishments?.[0]?.id?.toString() ?? ""),
        name: initialData?.name ?? "",
        code: initialData?.code ?? (next_code ?? ""),
        active: initialData?.active ?? true,
    })

    useEffect(() => {
        if (!isEdit && data.establishment_id) {
            const selectedEst = establishments?.find(
                (e: any) => e.id.toString() === data.establishment_id.toString()
            );

            if (selectedEst) {
                let nextCode = "001";
                if (selectedEst.emission_points && selectedEst.emission_points.length > 0) {
                    const codes = selectedEst.emission_points.map((p: any) => parseInt(p.code) || 0);
                    const maxCode = Math.max(...codes);
                    nextCode = (maxCode + 1).toString().padStart(3, '0');
                }
                
                setData("code", nextCode);
                clearErrors("code");
            }
        }
    }, [data.establishment_id, isEdit, establishments]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        const url = isEdit
            ? tenantRoutes.emissionPoints.update({ tenant: tenantSlug, emission_point: initialData.id }).url
            : tenantRoutes.emissionPoints.store({ tenant: tenantSlug }).url

        const options = {
            onSuccess: () => {
                toast.success(isEdit ? "Registro actualizado" : "Registro creado")
                onSuccess?.()
            },
            onError: (err: any) => {
                toast.error("Error al guardar", { description: Object.values(err)[0] as string })
            }
        }

        isEdit ? put(url, options) : post(url, options)
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <FieldGroup className="space-y-4">
                {/* Selector de Establecimiento */}
                <Field>
                    <FieldLabel className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Store className="w-4 h-4 text-muted-foreground" /> Establecimiento
                    </FieldLabel>
                    <Select 
                        value={data.establishment_id} 
                        onValueChange={(val) => setData("establishment_id", val)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una sucursal" />
                        </SelectTrigger>
                        <SelectContent>
                            {establishments?.map((est: any) => (
                                <SelectItem key={est.id} value={est.id.toString()}>
                                <div className="flex items-center justify-between w-full gap-8">
                                    <span className="text-sm font-medium truncate">
                                        {est.name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                        SRI: {est.code}
                                    </span>
                                </div>
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.establishment_id && <p className="text-xs text-destructive mt-1">{errors.establishment_id}</p>}
                </Field>

                <div className="grid grid-cols-4 gap-4">
                    <Field className="col-span-1">
                        <FieldLabel className="text-xs font-semibold mb-2 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-muted-foreground" /> Punto
                        </FieldLabel>
                        <Input 
                            value={data.code} 
                            onChange={e => setData("code", e.target.value)} 
                            className="font-mono text-center h-11"
                            maxLength={3}
                        />
                    </Field>
                    
                    <Field className="col-span-3">
                        <FieldLabel className="text-xs font-semibold mb-2 flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-muted-foreground" /> Nombre del Terminal
                        </FieldLabel>
                        <Input 
                            value={data.name} 
                            onChange={e => setData("name", e.target.value)} 
                            placeholder="Caja Principal" 
                            className="h-11"
                        />
                    </Field>
                </div>
                {errors.code && <p className="text-[10px] text-destructive font-bold">{errors.code}</p>}
                
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FieldLabel className="text-sm font-medium">Estado del punto</FieldLabel>
                        <p className="text-[11px] text-muted-foreground italic">Habilitado para emitir comprobantes</p>
                    </div>
                    <Switch 
                        checked={data.active} 
                        onCheckedChange={val => setData("active", val)} 
                    />
                </div>
            </FieldGroup>

            <div className="space-y-4 pt-2">
                <Button 
                    type="submit" 
                    disabled={processing} 
                    className="w-full"
                >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isEdit ? "Guardar cambios" : "Registrar punto de emisión"}
                </Button>
                
                <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50 border">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-snug text-muted-foreground">
                        Estructura SRI: <span className="font-mono font-bold text-foreground">
                            {establishments?.find((e:any) => e.id.toString() === data.establishment_id)?.code || '001'}-{data.code}-XXXXXXXXX
                        </span>. Asegúrese de que coincida con lo registrado en el portal del SRI.
                    </p>
                </div>
            </div>
        </form>
    )
}