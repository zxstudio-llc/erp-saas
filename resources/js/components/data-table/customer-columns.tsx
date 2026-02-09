"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { User, Mail, MapPin, Pencil, Trash2, Loader2, FileText, Ban, PencilOff } from "lucide-react"

export interface Customer {
    id: number;
    identification_type: string;
    identification: string;
    business_name: string;
    email: string;
    phone: string;
    address: string;
    active: boolean;
    invoices_count: number;
    created_at: string;
}

const getDocConfig = (type: string) => {
    const config: Record<string, { label: string; className: string }> = {
        'RUC': {
            label: 'RUC',
            className: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
        },
        'CI': {
            label: 'Cédula',
            className: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
        },
        'Pasaporte': {
            label: 'PAS',
            className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100'
        },
    };
    return config[type] || { label: type, className: 'bg-slate-100 text-slate-700' };
};

export const customerColumns = (
    onEdit: (customer: Customer) => void,
    onDelete: (customer: Customer) => void,
    onToggle: (customer: Customer) => void,
    onRestore: (customer: Customer) => void,
    processingId: number | null,
    isTrashed = false
): ColumnDef<Customer>[] => [
        {
            id: "index",
            header: "#",
            cell: ({ row }) => (
                <span className="text-xs font-mono font-bold text-foreground">
                    {(row.index + 1).toString().padStart(2, '0')}
                </span>
            ),
        },
        {
            id: "identification_type",
            header: "Tipo Doc",
            cell: ({ row }) => {
                const config = getDocConfig(row.original.identification_type);
                return (
                    <Badge className={`uppercase font-black text-[10px] shadow-sm ${config.className}`}>
                        {config.label}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "identification",
            header: "Identificación",
            cell: ({ row }) => (
                <span className="font-mono font-bold text-xs tracking-tighter">
                    {row.original.identification}
                </span>
            ),
        },
        {
            accessorKey: "business_name",
            header: "Cliente / Razón Social",
            cell: ({ row }) => {
                const isConsumidorFinal = row.original.identification === "9999999999999";

                return (
                    <div className="flex flex-col max-w-[250px]">
                        <span className="font-semibold text-sm truncate flex items-center gap-1.5">
                            <User className={`w-3.5 h-3.5 ${isConsumidorFinal ? 'text-primary' : 'text-muted-foreground'}`} />
                            {row.getValue("business_name")}
                            {isConsumidorFinal && (
                                <Badge variant="outline" className="text-[9px] py-0 h-4 bg-primary/5 border-primary/20 text-primary uppercase font-black">Universal</Badge>
                            )}
                        </span>
                        <div className="flex flex-col gap-0.5 mt-1">
                            {row.original.address && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
                                    <MapPin className="w-3 h-3 shrink-0" /> {row.original.address}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "email",
            header: "Contacto",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-xs truncate flex items-center gap-1.5 text-muted-foreground italic">
                        <Mail className="w-3 h-3" /> {row.original.email || 'Sin correo'}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "invoices_count",
            header: "Actividad",
            cell: ({ row }) => (
                <Badge variant="secondary" className="gap-1.5 font-bold text-[10px] bg-blue-50 text-blue-700 border-blue-100">
                    <FileText className="w-3 h-3" /> {row.getValue("invoices_count")} Facturas
                </Badge>
            ),
        },
        {
            accessorKey: "active",
            header: "Estado",
            cell: ({ row }) => {
                if (isTrashed) {
                    return (
                        <Badge variant="outline" className="text-rose-500 bg-rose-50 border-rose-100 uppercase text-[9px] font-black">
                            Eliminado
                        </Badge>
                    );
                }
    
                const isProcessing = processingId === row.original.id;
                const isConsumidorFinal = row.original.identification === "9999999999999";
    
                return (
                    <div className="flex items-center gap-3">
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        ) : (
                            <Switch
                                checked={row.original.active}
                                disabled={isConsumidorFinal}
                                onCheckedChange={() => onToggle(row.original)}
                            />
                        )}
                        <span className={`text-[10px] font-black uppercase ${row.original.active ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {row.original.active ? "Activo" : "Inactivo"}
                        </span>
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right">Acciones</div>,
            cell: ({ row }) => {
                const customer = row.original;
                const isConsumidorFinal = customer.identification === "9999999999999";
    
                if (isTrashed) {
                    return (
                        <div className="flex justify-end">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onRestore(customer)}
                                className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 gap-2 font-bold transition-colors"
                            >
                                <Loader2 className="w-3 h-3 animate-spin hidden group-data-[processing=true]:block" />
                                Restaurar Cliente
                            </Button>
                        </div>
                    )
                }

                return (
                    <div className="flex justify-end gap-1">
                        
                        {isConsumidorFinal ? (
                            <div className="h-8 w-8 flex items-center justify-center text-muted-foreground/30" title="Protegido por el sistema">
                                <PencilOff className="h-4 w-4" />
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-amber-600 hover:bg-amber-50"
                                onClick={() => onEdit(row.original)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}

                        {isConsumidorFinal ? (
                            <div className="h-8 w-8 flex items-center justify-center text-muted-foreground/30" title="Protegido por el sistema">
                                <Trash2 className="h-4 w-4" />
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:text-destructive hover:bg-destructive/5"
                                onClick={() => onDelete(row.original)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ]