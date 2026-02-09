"use client"

import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/data-table/data-table';
import { Plus, FileText } from "lucide-react";
import tenantRoutes from "@/routes/tenant"; 
import { Invoice, invoiceColumns } from '@/components/data-table/invoice-columns';

interface Props {
    invoices: { data: Invoice[]; current_page: number; last_page: number };
}

export default function InvoicesIndex({ invoices }: Props) {
    // Obtenemos el tenant desde los datos compartidos de Inertia
    const { tenant } = usePage().props as any;
    const tenantSlug = tenant?.slug;

    // Preparamos los breadcrumbs usando Wayfinder
    const breadcrumbs = [
        { title: 'Facturas', href: tenantRoutes.invoices.index({ tenant: tenantSlug }).url },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Facturas" />

            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary" />
                            Facturación Electrónica
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            Gestión y monitoreo de comprobantes
                        </p>
                    </div>

                    {/* Verificamos que tenantSlug exista antes de renderizar el link para evitar el crash */}
                    {tenantSlug && (
                        <Link href={tenantRoutes.invoices.create({ tenant: tenantSlug }).url}>
                            <Button className="font-bold shadow-sm rounded-xl">
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Factura
                            </Button>
                        </Link>
                    )}
                </div>

                <Card className="border-none shadow-2xl shadow-black/[0.03] rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <DataTable
                            columns={invoiceColumns}
                            data={invoices.data}
                            filterColumn="customer" 
                            placeholder="Buscar por cliente o comprobante..."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}