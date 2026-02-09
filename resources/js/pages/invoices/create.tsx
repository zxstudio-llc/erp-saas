"use client"

import React from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, Globe, NotepadText } from 'lucide-react';
import tenantRoutes from "@/routes/tenant";
import InvoiceForm from './invoice-form';

export default function CreateInvoice({ sequenceBlocks }: { sequenceBlocks: any[] }) {
  const { tenant } = usePage().props as any;
  const tenantSlug = tenant?.slug;

  const { data, setData, post, processing } = useForm({
    company_id: 1,
    customer_id: 1,
    sequence_block_id: sequenceBlocks[0]?.id || 0,
    items: [{
      main_code: '', description: '', quantity: 1, unit_price: 0,
      subtotal: 0, taxes: [{ code: '2', rate: 15, amount: 0 }], total: 0,
    }],
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    post(tenantRoutes.invoices.store({ tenant: tenantSlug }).url);
  };

  return (
    <AppLayout breadcrumbs={[{ title: 'Facturas', href: '#' }, { title: 'Nueva', href: '#' }]}>
      <Head title="Nueva Factura" />

      <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden">
        
        {/* HEADER: Fijo en la parte superior */}
        <div className="flex justify-between items-center p-4 md:px-8 md:py-4 border-b bg-background shrink-0">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-black flex items-center gap-2 leading-none">
                <NotepadText className="w-6 h-6 text-primary" /> Nueva Factura
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-muted/50 hidden sm:inline-flex">Borrador</Badge>
              </h1>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">Gestión de Comprobante Electrónico.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100">
              <Globe className="w-3 h-3" />
              Modo Online
            </div>
            <Button
              form="invoice-form"
              type="submit"
              disabled={processing}
              className="rounded-xl font-black h-10 px-6 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4 mr-2" />
              {processing ? 'Emitiendo...' : 'Guardar Factura'}
            </Button>
          </div>
        </div>

        {/* CONTENIDO: InvoiceForm debe manejar su propio scroll interno si es necesario */}
        <div className="flex-1 overflow-hidden">
            <InvoiceForm
                data={data}
                setData={setData}
                sequenceBlocks={sequenceBlocks}
                processing={processing}
                onSubmit={handleSubmit}
            />
        </div>
      </div>
    </AppLayout>
  );
}