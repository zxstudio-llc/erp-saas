"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { FileText, User, CheckCircle2, Clock, AlertCircle, WifiOff, ShieldCheck } from "lucide-react"

export interface Invoice {
    id: number;
    sequential: string;
    access_key: string | null;
    total: number;
    tax: number;
    status: 'offline_pending' | 'sent' | 'authorized' | 'rejected' | 'error';
    offline: boolean;
    generated_at: string;
    authorized_at: string | null;
    customer?: {
        business_name: string;
        identification: string;
    };
}

const getStatusConfig = (status: Invoice['status']) => {
    const configs: Record<Invoice['status'], { label: string; className: string; icon: any }> = {
        authorized: { 
            label: 'Autorizado', 
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: CheckCircle2 
        },
        sent: { 
            label: 'Enviado', 
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            icon: ShieldCheck 
        },
        offline_pending: { 
            label: 'Pendiente', 
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: Clock 
        },
        rejected: { 
            label: 'Rechazado', 
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            icon: AlertCircle 
        },
        error: { 
            label: 'Error', 
            className: 'bg-red-50 text-red-700 border-red-200',
            icon: AlertCircle 
        },
    };
    return configs[status] || { label: status, className: 'bg-muted text-muted-foreground', icon: AlertCircle };
};

export const invoiceColumns: ColumnDef<Invoice>[] = [
    {
        accessorKey: "sequential",
        header: "Comprobante",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <div className="flex items-center gap-2 font-mono font-bold text-xs text-primary tracking-tight">
                    <FileText className="w-3.5 h-3.5" />
                    {row.original.sequential}
                </div>
                {row.original.offline && (
                    <div className="flex items-center gap-1 text-[9px] text-amber-600 font-bold uppercase mt-1">
                        <WifiOff className="w-2.5 h-2.5" /> Offline
                    </div>
                )}
            </div>
        ),
    },
    {
        id: "customer",
        header: "Cliente",
        cell: ({ row }) => {
            const customer = row.original.customer;
            return (
                <div className="flex flex-col max-w-[220px]">
                    <span className="font-semibold text-sm truncate flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        {customer?.business_name || "Consumidor Final"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                        {customer?.identification || "9999999999999"}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "total",
        header: "Monto Total",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">
                    ${parseFloat(row.original.total.toString()).toLocaleString('es-EC', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium">
                    IVA: ${parseFloat(row.original.tax.toString()).toFixed(2)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Estado SRI",
        cell: ({ row }) => {
            const config = getStatusConfig(row.original.status);
            const Icon = config.icon;
            return (
                <Badge variant="outline" className={`gap-1.5 py-0.5 px-2 font-bold text-[10px] uppercase border ${config.className}`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                </Badge>
            );
        },
    },
    {
        accessorKey: "generated_at",
        header: () => <div className="text-right">Emisión</div>,
        cell: ({ row }) => {
            const date = new Date(row.original.generated_at);
            return (
                <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold">
                        {date.toLocaleDateString('es-EC')}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                        {date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            );
        },
    },
];