"use client"

import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    User, 
    Calendar, 
    Download, 
    ArrowLeft, 
    ShieldCheck, 
    Hash,
    Receipt,
    ExternalLink
} from 'lucide-react';
import tenantRoutes from "@/routes/tenant";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Tipado corregido según tu modelo Laravel
interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Invoice {
    id: number;
    sequential: string;
    access_key: string;
    status: 'offline_pending' | 'sent' | 'authorized' | 'rejected' | 'error';
    subtotal: number;
    tax: number;
    total: number;
    authorization_number?: string;
    authorized_at?: string;
    generated_at: string;
    xml?: string;
    customer?: {
        business_name: string;
        identification: string;
        email?: string;
    };
    items: InvoiceItem[];
}

export default function InvoicesShow({ invoice }: { invoice: Invoice }) {
    const { tenant } = usePage().props as any;
    const tenantSlug = tenant?.slug;

    const breadcrumbs = [
        { title: 'Facturas', href: tenantRoutes.invoices.index({ tenant: tenantSlug }).url },
        { title: invoice.sequential, href: '#' },
    ];

    const getStatusStyles = (status: string) => {
        const configs: Record<string, string> = {
            authorized: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            offline_pending: 'bg-amber-50 text-amber-700 border-amber-200',
            rejected: 'bg-rose-50 text-rose-700 border-rose-200',
            sent: 'bg-blue-50 text-blue-700 border-blue-200',
        };
        return configs[status] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Factura ${invoice.sequential}`} />
            
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                
                {/* Header con Acciones */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black tracking-tight">{invoice.sequential}</h1>
                            <Badge variant="outline" className={`uppercase text-[10px] font-bold px-2 ${getStatusStyles(invoice.status)}`}>
                                {invoice.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs">
                            <Hash className="w-3 h-3" />
                            {invoice.access_key || 'CLAVE NO GENERADA'}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="font-bold rounded-xl" onClick={() => window.history.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                        </Button>
                        {invoice.xml && (
                            <Button variant="default" size="sm" className="font-bold rounded-xl shadow-lg shadow-primary/20">
                                <Download className="w-4 h-4 mr-2" /> XML
                            </Button>
                        )}
                        <Button variant="outline" size="sm" className="font-bold rounded-xl border-primary text-primary hover:bg-primary/5">
                            <ExternalLink className="w-4 h-4 mr-2" /> RIDE (PDF)
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Columna Principal: Datos y Tabla */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Info Cliente */}
                        <Card className="border-none shadow-2xl shadow-black/[0.03] rounded-2xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" /> Información del Receptor
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Razón Social</p>
                                    <p className="text-sm font-semibold text-foreground">{invoice.customer?.business_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Identificación</p>
                                    <p className="text-sm font-mono">{invoice.customer?.identification}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detalle de Productos */}
                        <Card className="border-none shadow-2xl shadow-black/[0.03] rounded-2xl overflow-hidden">
                            <div className="p-4 border-b bg-muted/30">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-primary" /> Detalle del Comprobante
                                </CardTitle>
                            </div>
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="text-[10px] font-bold uppercase">Descripción</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase w-[80px]">Cant.</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase">P. Unit</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoice.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-sm font-medium">{item.description}</TableCell>
                                            <TableCell className="text-right text-sm font-mono">{item.quantity}</TableCell>
                                            <TableCell className="text-right text-sm font-mono">${item.unit_price.toFixed(2)}</TableCell>
                                            <TableCell className="text-right text-sm font-bold">${item.subtotal.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    {/* Columna Lateral: Estado y Totales */}
                    <div className="space-y-6">
                        
                        {/* Estado SRI */}
                        <Card className="border-none shadow-2xl shadow-black/[0.03] rounded-2xl bg-primary/5 border-l-4 border-l-primary">
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Estado del SRI</p>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-primary" />
                                        <span className="font-bold text-sm uppercase">{invoice.status}</span>
                                    </div>
                                </div>
                                {invoice.authorized_at && (
                                    <div className="pt-3 border-t border-primary/10">
                                        <p className="text-[10px] font-bold text-muted-foreground">FECHA AUTORIZACIÓN</p>
                                        <p className="text-xs font-mono">{new Date(invoice.authorized_at).toLocaleString()}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Resumen de Totales */}
                        <Card className="border-none shadow-2xl shadow-black/[0.03] rounded-2xl bg-card">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold">Resumen Financiero</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-mono font-bold">${invoice.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">IVA (15%)</span>
                                    <span className="font-mono font-bold">${invoice.tax.toFixed(2)}</span>
                                </div>
                                <div className="pt-4 border-t flex justify-between items-end">
                                    <span className="text-base font-black uppercase">Total</span>
                                    <span className="text-2xl font-black text-primary font-mono tracking-tighter">
                                        ${invoice.total.toFixed(2)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}