"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Pencil, Power, Layers, Loader2, Store, MonitorSmartphone } from "lucide-react"

export interface EmissionPoint {
    id: number;
    code: string;
    name: string;
    active: boolean;
    establishment_id: number;
    establishment: {
        id: number;
        name: string;
        code: string;
    };
    sequence_blocks_count: number;
}

export const emissionPointColumns = (
    onEdit: (ep: EmissionPoint) => void,
    onToggle: (ep: EmissionPoint) => void,
    onDelete: (ep: EmissionPoint) => void,
    processingId: number | null
): ColumnDef<EmissionPoint>[] => [
    {
        accessorKey: "code",
        header: "Código",
        cell: ({ row }) => (
            <div className={`flex items-center gap-2 ${processingId === row.original.id ? 'opacity-40' : ''}`}>
                <code className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs tracking-tighter">
                    {row.original.code}
                </code>
            </div>
        ),
    },
    {
        accessorKey: "name",
        header: "Nombre del Punto",
        cell: ({ row }) => (
            <div className={`flex flex-col max-w-[200px] ${processingId === row.original.id ? 'opacity-40' : ''}`}>
                <span className="font-semibold text-sm truncate flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-muted-foreground" /> {row.original.name}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-start gap-1 mt-0.5">
                    <MonitorSmartphone className="w-3 h-3 mt-0.5 shrink-0" /> 
                    <span className="line-clamp-1">Terminal de Facturación</span>
                </span>
            </div>
        ),
    },
    {
        id: "establishment",
        header: "Establecimiento",
        cell: ({ row }) => (
            <div className={`flex items-center gap-2 ${processingId === row.original.id ? 'opacity-40' : ''}`}>
                <Badge variant="secondary" className="gap-2">
                <span>
                {row.original.establishment.code}
                </span>
                <span>
                {row.original.establishment.name}
                </span>
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: "sequence_blocks_count",
        header: "Bloques",
        cell: ({ row }) => (
            <div className={`${processingId === row.original.id ? 'opacity-40' : ''}`}>
                <Badge variant="secondary" className="gap-1">
                    <Layers className="w-3 h-3" />
                    {row.original.sequence_blocks_count}
                </Badge>
            </div>
        ),
    },
    {
        accessorKey: "active",
        header: "Estado",
        cell: ({ row }) => {
            const active = row.original.active;
            const isProcessing = processingId === row.original.id;

            return (
                <div className="flex items-center gap-3">
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                        <Switch 
                            checked={active} 
                            onCheckedChange={() => onToggle(row.original)}
                        />
                    )}
                    <span className={`text-[10px] font-bold uppercase ${active ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {active ? "Activo" : "Inactivo"}
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
                    onClick={() => onToggle(row.original)}
                >
                    <Power className={`h-4 w-4 ${row.original.active ? 'text-orange-400' : 'text-emerald-500'}`} />
                </Button>
            </div>
        ),
    },
];