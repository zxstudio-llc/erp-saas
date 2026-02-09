"use client"

import { useState, useCallback } from "react"
import { useForm, usePage } from "@inertiajs/react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
    Save, Loader2, Info, Layers, Hash, CheckCircle2,
    Target, Map as MapIcon, Navigation, MapPin,
    Building2, Settings2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { debounce } from "lodash"
import establishments from "@/routes/tenant/establishments"
import { MapPicker } from "@/components/map/map-picker"
import { toast } from "sonner"

export function EstablishmentForm({ tenantSlug, companyId, initialData, onSuccess }: any) {
    const { next_codes }: any = usePage().props;
    const isEdit = !!initialData

    const [inputMode, setInputMode] = useState<string>("map")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [openSearch, setOpenSearch] = useState(false)

    const { data, setData, post, put, transform, processing, errors } = useForm({
        company_id: companyId,
        name: initialData?.name ?? "",
        address: initialData?.address ?? "",
        latitude: initialData?.latitude ?? -2.1465,
        longitude: initialData?.longitude ?? -79.9135,
        code: initialData?.code ?? (next_codes?.establishment ?? ""),
        create_default_point: true,
        point_code: next_codes?.emission_point ?? "001",
    })

    const fetchAddresses = useCallback(
        debounce(async (query: string) => {
            if (query.length < 4) return;
            setIsSearching(true)
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=-81.3,1.5,-75.2,-5.0&bounded=0&limit=6`
                )
                const results = await res.json()
                setSearchResults(results)
                setOpenSearch(true)
            } catch (e) { console.error(e) } finally { setIsSearching(false) }
        }, 500), []
    )

    const handleSelectResult = (result: any) => {
        setData((prev: any) => ({
            ...prev,
            address: result.display_name,
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon)
        }))
        setSearchResults([])
        setOpenSearch(false)
    }

    const handleMapChange = (mapData: { lat: number; lng: number; address?: string }) => {
        setData((prev: any) => ({
            ...prev,
            latitude: mapData.lat,
            longitude: mapData.lng,
            address: mapData.address || prev.address
        }))
    }

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        transform((data) => ({
            ...data,
            latitude: String(data.latitude),
            longitude: String(data.longitude),
        }))

        const url = isEdit
            ? establishments.update({ tenant: tenantSlug, establishment: initialData.id }).url
            : establishments.store({ tenant: tenantSlug }).url

        const options = {
            onSuccess: () => {
                toast.success(isEdit ? "Establecimiento actualizado" : "Establecimiento registrado", {
                    description: isEdit
                        ? `Los cambios en ${data.name} se guardaron correctamente.`
                        : `La sucursal ${data.name} ya puede emitir comprobantes.`,
                })
                onSuccess?.()
            },
            onError: (errors: any) => {
                const firstError = Object.values(errors)[0] as string
                toast.error("Error al guardar", {
                    description: firstError || "Verifica los datos ingresados.",
                })
            }
        }

        if (isEdit) {
            put(url, options)
        } else {
            post(url, options)
        }
    }

    return (
        <form onSubmit={submit} className="space-y-6">
            <Tabs defaultValue="general" className="w-full transition-all duration-500">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="general" className="gap-2 transition-all">
                        <Building2 className="w-4 h-4" /> Datos Generales
                    </TabsTrigger>
                    {!isEdit && (
                        <TabsTrigger value="sri" className="gap-2 transition-all">
                            <Settings2 className="w-4 h-4" /> Configuración SRI
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Contenedor con min-height para suavizar la transición de altura */}
                <div className="relative min-h-auto">
                    <TabsContent value="general" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 ease-in-out">
                        <FieldGroup className="grid gap-4">
                            <div className="grid grid-cols-4 gap-2">
                                <Field className="col-span-1">
                                    <FieldLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                                        <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> Código</span>
                                    </FieldLabel>
                                    <div className="flex h-9 items-center justify-center rounded-md border border-input bg-muted/50 font-mono font-bold text-primary">
                                        {data.code}
                                    </div>
                                </Field>
                                <Field className="col-span-3">
                                    <FieldLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Nombre del Establecimiento</FieldLabel>
                                    <Input value={data.name} onChange={(e) => setData("name", e.target.value)} placeholder="Ej. Sucursal Principal" className="bg-background" autoFocus />
                                    {errors.name && <span className="text-xs text-destructive mt-1 block">{errors.name}</span>}
                                </Field>
                            </div>

                            <div className="space-y-4 rounded-xl border bg-muted/10 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-2">
                                        <Target className="w-3 h-3" /> Geolocalización del Establecimiento
                                    </span>
                                    <ToggleGroup type="single" value={inputMode} onValueChange={(val) => val && setInputMode(val)} variant="outline" size="sm">
                                        <ToggleGroupItem value="map" className="text-[10px] gap-1"><MapIcon className="w-3 h-3" /> Mapa</ToggleGroupItem>
                                        <ToggleGroupItem value="manual" className="text-[10px] gap-1"><Navigation className="w-3 h-3" /> Coordenadas</ToggleGroupItem>
                                    </ToggleGroup>
                                </div>

                                <div className="relative z-[50]">
                                    <FieldLabel className="text-[10px] uppercase font-semibold mb-1 block">Dirección Física (SRI)</FieldLabel>
                                    <Command className="rounded-lg border shadow-sm overflow-visible">
                                        <div className="flex items-center px-3 border-b">
                                            <MapPin className="mr-2 h-4 w-4 shrink-0 opacity-50 text-primary" />
                                            <input
                                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                                                placeholder="Buscar en Ecuador (Ej: Av. Amazonas, Quito...)"
                                                value={data.address}
                                                onChange={(e) => {
                                                    setData("address", e.target.value);
                                                    fetchAddresses(e.target.value);
                                                }}
                                                onFocus={() => data.address.length > 3 && setOpenSearch(true)}
                                            />
                                            {isSearching && <Loader2 className="ml-2 h-4 w-4 animate-spin opacity-50" />}
                                        </div>
                                        {openSearch && searchResults.length > 0 && (
                                            <div className="absolute top-11 w-full bg-popover border rounded-md shadow-2xl z-[100] max-h-[200px] overflow-y-auto animate-in fade-in zoom-in-95">
                                                <CommandList>
                                                    <CommandGroup heading="Sugerencias en Ecuador">
                                                        {searchResults.map((res, i) => (
                                                            <CommandItem key={i} onSelect={() => handleSelectResult(res)} className="cursor-pointer p-3 hover:bg-muted border-b last:border-0">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="font-bold text-xs line-clamp-1">{res.display_name.split(',')[0]}</span>
                                                                    <span className="text-[10px] text-muted-foreground line-clamp-1">{res.display_name}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </div>
                                        )}
                                    </Command>
                                    {errors.address && <span className="text-xs text-destructive mt-1 block">{errors.address}</span>}
                                </div>

                                <MapPicker lat={data.latitude} lng={data.longitude} onChange={handleMapChange} />

                                {inputMode === "manual" && (
                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                                        <Field>
                                            <FieldLabel className="text-[9px] uppercase font-bold text-muted-foreground">Latitud</FieldLabel>
                                            <Input type="number" step="any" value={data.latitude} onChange={e => setData("latitude", parseFloat(e.target.value) || 0)} className="h-9 font-mono text-xs" />
                                        </Field>
                                        <Field>
                                            <FieldLabel className="text-[9px] uppercase font-bold text-muted-foreground">Longitud</FieldLabel>
                                            <Input type="number" step="any" value={data.longitude} onChange={e => setData("longitude", parseFloat(e.target.value) || 0)} className="h-9 font-mono text-xs" />
                                        </Field>
                                    </div>
                                )}
                            </div>
                        </FieldGroup>
                    </TabsContent>

                    <TabsContent value="sri" className="mt-0 animate-in fade-in slide-in-from-right-4 duration-500 ease-in-out">
                        <div className="rounded-lg border border-border bg-card overflow-hidden transition-all duration-300">
                            <div className="flex items-center justify-between border-b bg-muted/40 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><Layers className="h-4 w-4" /></div>
                                    <div>
                                        <h4 className="text-sm font-bold leading-none">Punto de Emisión</h4>
                                        <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-tight">Estructura Inicial SRI</p>
                                    </div>
                                </div>
                                <Switch checked={data.create_default_point} onCheckedChange={(val) => setData("create_default_point", val)} />
                            </div>
                            {data.create_default_point && (
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 rounded-md border bg-muted/20 p-3">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Punto</span>
                                            <div className="font-mono text-lg font-black text-foreground tabular-nums">{data.point_code}</div>
                                        </div>
                                        <div className="space-y-1 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                                                Rango Secuencial
                                            </span>
                                            <div className="flex flex-row flex-wrap items-center gap-2 font-mono text-[11px] font-bold tabular-nums tracking-tighter text-foreground/80">
                                                <Badge className="shrink-0">000000001</Badge>

                                                <Badge className="shrink-0">000001000</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-primary/80 bg-primary/5 p-2 rounded border border-primary/10 transition-all">
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span className="text-[10px] font-medium italic">Se generará automáticamente un bloque disponible.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>

            <div className="space-y-3">
                <Button type="submit" disabled={processing} className="w-full text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    {isEdit ? "Actualizar Registro" : "Registrar Sucursal"}
                </Button>
                <div className="flex items-center gap-3 rounded-md border border-amber-500/30 bg-amber-500/30 p-2 justify-center">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-[10px] leading-snug text-muted-foreground">
                        Al crear el establecimiento <span className="font-bold text-foreground">{data.code}</span>, podrá empezar a emitir comprobantes electrónicos de forma inmediata.
                    </p>
                </div>
            </div>
        </form>
    )
}