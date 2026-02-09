"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Store, MapPin, Building2, Pencil, Power, Layers, Database, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface InvoiceSequenceBlock {
    id: number
    from_number: number
    to_number: number
    current_number: number
    status: string
}

export interface EmissionPoint {
    id: number
    code: string
    name: string
    active: boolean
}

export interface Establishment {
    id: number
    company_id: number
    code: string
    name: string
    address: string
    active: boolean
    is_main: boolean
    company?: {
        business_name: string
        ruc: string
        environment: 'test' | 'prod'
    }
    emission_points?: EmissionPoint[]
    sequence_blocks?: InvoiceSequenceBlock[]
}

export const establishmentColumns = (
    onEdit: (establishment: Establishment) => void,
    onToggle: (establishment: Establishment) => void,
    processingId: number | null
): ColumnDef<Establishment>[] => [
    {
        accessorKey: "code",
        header: "Código",
        cell: ({ row }) => (
            <div className={`flex flex-col items-start gap-1 ${processingId === row.original.id ? 'opacity-40' : ''}`}>
                <code className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs tracking-tighter">
                    {row.getValue("code")}
                </code>
                {row.original.is_main && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase border-amber-500 text-amber-600 bg-amber-50">Matriz</Badge>
                )}
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: "Establecimiento",
        cell: ({ row }) => (
            <div className={`flex flex-col max-w-[200px] ${processingId === row.original.id ? 'opacity-40' : ''}`}>
                <span className="font-semibold text-sm truncate flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-muted-foreground" /> {row.getValue("name")}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> 
                    <span className="line-clamp-1">{row.original.address || "Sin dirección registrada"}</span>
                </span>
            </div>
        ),
    },
    {
        id: "structure",
        header: "Estructura SRI",
        cell: ({ row }) => {
            const points = row.original.emission_points || [];
            const blocks = row.original.sequence_blocks || [];
            const isProcessing = processingId === row.original.id;

            return (
                <div className={`flex items-start gap-3 py-1 ${isProcessing ? 'opacity-40' : ''}`}>
                    {/* Puntos de Emisión */}
                    <div className="flex flex-col gap-1">
                        {points.length > 0 ? points.map(p => (
                            <TooltipProvider key={p.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="gap-1 font-mono text-[10px] bg-blue-50 text-blue-700 border-blue-100 transition-colors hover:bg-blue-100">
                                            <Layers className="w-3 h-3" /> {p.code}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Punto: {p.name}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )) : <span className="text-[10px] text-muted-foreground italic px-1">---</span>}
                    </div>

                    {/* Bloques de Secuencia */}
                    <div className="flex flex-col gap-1">
                        {blocks.length > 0 ? blocks.map(b => (
                            <Badge key={b.id} variant="secondary" className="gap-1 font-mono text-[9px] bg-orange-50 text-orange-700 border-orange-100 whitespace-nowrap transition-colors hover:bg-orange-100">
                                <Database className="w-3 h-3" />
                                {String(b.from_number).padStart(9, '0')} - {String(b.to_number).padStart(9, '0')}
                            </Badge>
                        )) : <span className="text-[10px] text-muted-foreground italic px-1">---</span>}
                    </div>
                </div>
            )
        }
    },
    {
        id: "company",
        header: "Empresa",
        cell: ({ row }) => (
            <div className={`flex flex-col gap-0.5 ${processingId === row.original.id ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    {row.original.company?.business_name}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono ml-5 flex items-center gap-2">
                    <span>RUC: {row.original.company?.ruc}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 uppercase border-primary/20">
                        {row.original.company?.environment}
                    </Badge>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "active",
        header: "Estado",
        cell: ({ row }) => {
            const isMain = row.original.is_main;
            const isProcessing = processingId === row.original.id;

            return (
                <div className="flex items-center gap-3">
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                        <Switch 
                            checked={row.original.active} 
                            onCheckedChange={() => !isMain && onToggle(row.original)}
                            disabled={isMain}
                        />
                    )}
                    <span className={`text-[10px] font-bold uppercase ${row.original.active ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {row.original.active ? "Activo" : "Inactivo"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Acciones</div>,
        cell: ({ row }) => (
            <div className={`flex justify-end gap-1 ${processingId === row.original.id ? 'invisible' : ''}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(row.original)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => !row.original.is_main && onToggle(row.original)}
                    disabled={row.original.is_main}
                >
                    <Power className={`h-4 w-4 ${row.original.active ? 'text-orange-400' : 'text-emerald-500'}`} />
                </Button>
            </div>
        ),
    },
]